const { snsClient, PublishCommand } = require('../../utility/aws');
const {generateOTP}=require('../../utility/otp')
const OTP =  require("../../models/userAuth/otp")
const sendMobileOtp = async (req,res)=>{
    const { phone } = req.body;
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    // Store in DB
    await OTP.create({ phone, code, expiresAt });  
  const params = {
      Message: `Your verification code is ${code}`,
      PhoneNumber: phone,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'String',
        },
      },
    };
  
    try {
      const command = new PublishCommand(params);
      const data = await snsClient.send(command);
      console.log(data);
      res.json({ message: 'OTP sent successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
  

  // Verify OTP
const verifyMobileOtp=  async (req, res) => {
    const { phone, code } = req.body;
  
    const record = await OTP.findOne({ phone, code });
    if (!record) return res.status(400).json({ error: 'Invalid code' });
  
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Code expired' });
    }
  
    // OTP is valid – delete it and mark user as verified (or register user)
    await OTP.deleteOne({ _id: record._id });
  
    res.json({ message: 'Phone verified successfully' });
  }


  module.exports  = {sendMobileOtp,verifyMobileOtp}