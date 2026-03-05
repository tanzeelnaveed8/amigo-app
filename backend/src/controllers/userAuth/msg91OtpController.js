const axios = require("axios").default;
const { generateOTP } = require("../../utility/otp");
const OTP = require("../../models/userAuth/otp");
const { generateToken } = require("../../middleware/jwtToken");
const userCredentialDB = require("../../models/userAuth/userCredential");

/**
 * Helper: Send OTP via MSG91 to phone. Stores OTP in DB and sends SMS.
 * @param {string} phone - Mobile number with country code (e.g., 923039971549)
 * @param {string} flowType - 'register' or 'login'
 * @param {string|null} userId - Optional; for login flow
 * @returns {Promise<{ expiresAt: Date }>}
 * @throws on validation, config, or MSG91 API errors
 */
async function sendOtpSms(phone, flowType = "register", userId = null) {
  const cleanPhone =
    phone && phone !== "undefined" && phone !== "" && phone !== "null"
      ? String(phone).trim().replace(/^\+/, "")
      : "";

  const phoneRegex = /^[1-9]\d{9,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    const err = new Error(
      "Invalid phone number format. Please include country code (e.g., 923039971549)"
    );
    err.status = 400;
    throw err;
  }

  const validFlowTypes = ["register", "login"];
  if (!validFlowTypes.includes(flowType)) {
    const err = new Error('Invalid flowType. Must be "register" or "login"');
    err.status = 400;
    throw err;
  }

  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    const err = new Error("MSG91_AUTH_KEY is not configured in environment variables");
    err.status = 500;
    throw err;
  }

  const templateId = process.env.MSG91_TEMPLET_ID;
  if (!templateId) {
    const err = new Error("MSG91_TEMPLET_ID is not configured in environment variables");
    err.status = 500;
    throw err;
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OTP.create({
    phone: String(phone).trim(),
    code,
    expiresAt,
    flowType,
    ...(userId && { userId }),
  });

  const recipients = [{ mobiles: cleanPhone, var: code }];
  const requestData = { template_id: templateId, short_url: "0", recipients };

  const options = {
    method: "POST",
    url: "https://control.msg91.com/api/v5/flow",
    headers: {
      accept: "application/json",
      authkey,
      "content-type": "application/json",
    },
    data: requestData,
  };

  await axios.request(options);
  return { expiresAt };
}

exports.sendOtpSms = sendOtpSms;

/**
 * Send OTP to mobile number using MSG91 Flow API
 * @route POST /api/user-auth/msg91/send-otp
 * @body {string} phone - Mobile number with country code (e.g., 923039971549)
 * @body {string} flowType - Flow type: 'register' or 'login' (optional, defaults to 'register')
 *
 * @example Request Body:
 * {
 *   "phone": "923039971549",
 *   "flowType": "register"
 * }
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phone, flowType = "register" } = req.body;

    if (!phone || String(phone).trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "Phone number is required",
      });
    }

    const { expiresAt } = await sendOtpSms(phone, flowType);

    res.status(200).json({
      status: 200,
      message: "OTP sent successfully",
      data: {
        phone: String(phone).trim(),
        flowType,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error sending OTP:", error);

    if (error.response) {
      res.status(error.response.status || 500).json({
        status: error.response.status || 500,
        message:
          error.response.data?.message || error.message || "Failed to send OTP",
        error: error.response.data,
      });
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Failed to send OTP",
      });
    }
  }
};
exports.sendFlowSms = async (req, res) => {
  try {
    const { short_url, short_url_expiry, realTimeResponse, recipients } =
      req.body;

    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Recipients array is required and must not be empty",
      });
    }

    // Get MSG91 auth key from environment
    const authkey = process.env.MSG91_AUTH_KEY;
    if (!authkey) {
      return res.status(500).json({
        status: 500,
        message: "MSG91_AUTH_KEY is not configured in environment variables",
      });
    }

    // Default template ID
    const defaultTemplateId = "691389f55b417126d0681d5b";
    // const defaultTemplateId = '691089066c9ceb78ee67f3e4';
    const finalTemplateId = process.env.MSG91_TEMPLET_ID;

    // Build recipients array with proper structure
    const formattedRecipients = recipients.map((recipient, index) => {
      if (!recipient.mobiles) {
        throw new Error(`Recipient at index ${index} is missing mobile number`);
      }

      // Build recipient object with mobiles and all other properties as variables
      const recipientObj = {
        mobiles: recipient.mobiles.toString().trim(),
      };

      // Add all other properties as variables (otp, VAR1, VAR2, etc.)
      Object.keys(recipient).forEach((key) => {
        if (key !== "mobiles") {
          recipientObj[key] = recipient[key];
        }
      });

      return recipientObj;
    });

    // Build request data payload
    const requestData = {
      template_id: finalTemplateId,
      short_url: short_url || "0",
      recipients: formattedRecipients,
    };

    // Add optional fields if provided
    if (short_url_expiry !== undefined) {
      requestData.short_url_expiry = short_url_expiry.toString();
    }

    if (realTimeResponse !== undefined) {
      requestData.realTimeResponse = realTimeResponse.toString();
    }

    // Log the payload being sent
    console.log(
      "MSG91 Flow API Payload:",
      JSON.stringify(requestData, null, 2)
    );

    // Prepare axios options
    const options = {
      method: "POST",
      url: "https://control.msg91.com/api/v5/flow",
      headers: {
        accept: "application/json",
        authkey: authkey,
        "content-type": "application/json",
      },
      data: requestData,
    };

    // Make request using axios
    const { data } = await axios.request(options);

    res.status(200).json({
      status: 200,
      message: "SMS sent successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error sending Flow SMS:", error);

    if (error.response) {
      res.status(error.response.status || 500).json({
        status: error.response.status || 500,
        message:
          error.response.data?.message || error.message || "Failed to send SMS",
        error: error.response.data,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: error.message || "Failed to send SMS",
      });
    }
  }
};
/**
 * Verify OTP and generate registration token
 * @route POST /api/user-auth/msg91/verify-otp
 * @body {string} phone - Mobile number with country code (e.g., 923039971549)
 * @body {string} code - OTP code to verify
 * @body {string} flowType - Flow type: 'register' or 'login' (optional, defaults to 'register')
 *
 * @example Request Body:
 * {
 *   "phone": "923039971549",
 *   "code": "123456",
 *   "flowType": "register"
 * }
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, flowType = "register" } = req.body;
    console.log("phone", phone);
    console.log("code", otp);
    console.log("flowType", flowType);
    // Validate required fields
    if (!phone || phone.trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "Phone number is required",
      });
    }

    if (!otp || otp.trim() === "") {
      return res.status(400).json({
        status: 400,
        message: "OTP code is required",
      });
    }

    // Validate phone number format
    const phoneRegex = /^[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        status: 400,
        message:
          "Invalid phone number format. Please include country code (e.g., 923039971549)",
      });
    }

    // Validate OTP format (typically 4-6 digits)
    const otpRegex = /^\d{4,6}$/;
    if (!otpRegex.test(otp.trim())) {
      return res.status(400).json({
        status: 400,
        message: "Invalid OTP format. OTP should be 4-6 digits",
      });
    }

    // Find OTP record in database
    const otpRecord = await OTP.findOne({
      phone: phone.trim(),
      code: otp.trim(),
      flowType: flowType,
    });

    if (!otpRecord) {
      return res.status(401).json({
        status: 401,
        message: "Invalid OTP code",
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      // Delete expired OTP
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        status: 401,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // OTP is valid - delete it from database
    await OTP.deleteOne({ _id: otpRecord._id });

    if (flowType === "login") {
      const user = await userCredentialDB.findOne({ phone: phone.trim() });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found. Please register first.",
        });
      }

      const token = generateToken({
        _id: user._id.toString(),
        phone: phone.trim(),
      });

      user.token = token;
      await user.save();

      const userData = user.toObject();
      delete userData.password;

      res.status(200).json({
        status: 200,
        message: "OTP verified successfully",
        token: token,
        data: userData,
      });
    } else {
      const token = generateToken({
        _id: null,
        phone: phone.trim(),
      });

      res.status(200).json({
        status: 200,
        message: "OTP verified successfully",
        data: {
          phone: phone.trim(),
          flowType: flowType,
          token: token,
        },
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to verify OTP",
    });
  }
};

/**
 * Send SMS using MSG91 Flow API with axios
 * @route POST /api/user-auth/msg91/send-flow-sms
 * @body {string} template_id - SMS template ID (optional, defaults to 691089066c9ceb78ee67f3e4)
 * @body {string} short_url - "1" (On) or "0" (Off) (optional, defaults to "0")
 * @body {string} short_url_expiry - Seconds (Optional)
 * @body {string} realTimeResponse - "1" (Optional)
 * @body {array} recipients - Array of recipient objects with mobiles and otp (or other variables)
 *
 * @example Request Body:
 * {
 *   "recipients": [
 *     { "mobiles": "923039971549", "otp": "1122" },
 *     { "mobiles": "923306146540", "otp": "1122" },
 *     { "mobiles": "919971645229", "otp": "1122" }
 *   ]
 * }
 */
const defaultTemplateId = "691389f55b417126d0681d5b";
exports.sendFlowSms = async (req, res) => {
  try {
    const { short_url, short_url_expiry, realTimeResponse, recipients } =
      req.body;

    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Recipients array is required and must not be empty",
      });
    }

    // Get MSG91 auth key from environment
    const authkey = process.env.MSG91_AUTH_KEY;
    if (!authkey) {
      return res.status(500).json({
        status: 500,
        message: "MSG91_AUTH_KEY is not configured in environment variables",
      });
    }

    // Default template ID
    // const defaultTemplateId = '691089066c9ceb78ee67f3e4';
    const finalTemplateId = process.env.MSG91_TEMPLET_ID;

    // Build recipients array with proper structure
    const formattedRecipients = recipients.map((recipient, index) => {
      if (!recipient.mobiles) {
        throw new Error(`Recipient at index ${index} is missing mobile number`);
      }

      // Build recipient object with mobiles and all other properties as variables
      const recipientObj = {
        mobiles: recipient.mobiles.toString().trim(),
      };

      // Add all other properties as variables (otp, VAR1, VAR2, etc.)
      Object.keys(recipient).forEach((key) => {
        if (key !== "mobiles") {
          recipientObj[key] = recipient[key];
        }
      });

      return recipientObj;
    });

    // Build request data payload
    const requestData = {
      template_id: finalTemplateId,
      short_url: short_url || "0",
      recipients: formattedRecipients,
    };

    // Add optional fields if provided
    if (short_url_expiry !== undefined) {
      requestData.short_url_expiry = short_url_expiry.toString();
    }

    if (realTimeResponse !== undefined) {
      requestData.realTimeResponse = realTimeResponse.toString();
    }

    // Log the payload being sent
    console.log(
      "MSG91 Flow API Payload:",
      JSON.stringify(requestData, null, 2)
    );

    // Prepare axios options
    const options = {
      method: "POST",
      url: "https://control.msg91.com/api/v5/flow",
      headers: {
        accept: "application/json",
        authkey: authkey,
        "content-type": "application/json",
      },
      data: requestData,
    };

    // Make request using axios
    const { data } = await axios.request(options);

    res.status(200).json({
      status: 200,
      message: "SMS sent successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error sending Flow SMS:", error);

    if (error.response) {
      res.status(error.response.status || 500).json({
        status: error.response.status || 500,
        message:
          error.response.data?.message || error.message || "Failed to send SMS",
        error: error.response.data,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: error.message || "Failed to send SMS",
      });
    }
  }
};
