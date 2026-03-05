const nodemailer = require("nodemailer");
const { generateOTP } = require('../otp')

// Read SMTP configuration from environment variables
const {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
  EMAIL_FROM,
} = process.env;

let transporter = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: Number(EMAIL_SMTP_PORT) || 587, // default to 587
  secure: EMAIL_SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
});

exports.sendOtp = async (email) => {
  const otp = generateOTP()
  try {

    let info = await transporter.sendMail({
      from: `Amigo <${EMAIL_FROM || EMAIL_SMTP_USER}>`, // sender address
      to: email,// sender address
      subject: "Amigo - OTP Verification", // Subject line
      text: " ", // plain text body
      html: `<a style="text-decoration: none;" href="https://www.cryptogram.tech">
        <table style="background-color:white	;width:800px;  margin:auto;">
        <tr style="width: 94%;height: 300px;background-color: #F1BC18;display: block; margin: 3%;">
          <td style="width: 800px;height: 300px;">
              <img src="https://imsmart.s3.ap-south-1.amazonaws.com/logo.png" width="300px" style="margin-left: 224.2px;" >
          </td>
          <tr>
          <td>
            <h2 style="margin-top: 20px;text-align: center;margin-bottom: 0;color: #2a2a2a;padding: 0px 100px;font-size: 34px;line-height: 46px;font-weight: 900;">${email} your OTP is  </h2>
          </td>
        </tr>
  
        <tr>
          <td>
            <h2 style="margin-top: 20px;text-align: center;margin-bottom: 0;color: #2a2a2a;padding: 0px 100px;font-size: 50px;line-height: 46px;font-weight: 900;">${otp} </h2>
          </td>
        </tr>
    
  
        <tr > 
          <td style="">
            <div style="background-color:#272A30; height: 150px;  ">
              <div style="color:white; text-align: center; margin-top: 50px; ">
                      <p style="padding-top: 50px; margin-bottom: 0;">All Copyright reserved. © 2021 <a href="https://www.cryptogram.tech" style="color: #f1bc18;
    font-weight: 900;">cryptogram.tech</a></p> 
                      <p style="color:white; margin-top: 0; ">info.cryptogram.tech</p>
                   </div>
            </div>
          </td>
        </tr>
      </table>
      </a>
    `,
    });
    if (info) {
      return otp;
    } else {
      //// console.log("error");
    }
  } catch (err) {
    //// console.log(err);
    throw err
  }
};


