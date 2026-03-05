const accountSid = process.env.TWILLIO_SID_APP
const authToken = process.env.TWILLIO_Auth_APP
const client = require('twilio')(accountSid, authToken);
const {generateOTP}=require('../otp')
const otpTophone = async (phone) => {
   
        const otp = generateOTP()
        const message=`Your Cryptogram verification code is: ${otp}\n Please do not share this code with anyone for security reasons. Cryptogram will never ask for your code through any means of communication.`
        //// console.log({ otp });
        await client.messages.create({
            body: message,
            to: phone,
            from: '+14153199794',
        }).then((res)=>{
            //// console.log('otp sent');
        }).catch((err)=>{
            //// console.log('otp sent failed',{err});
        })
       return otp;
   
}
module.exports={otpTophone}