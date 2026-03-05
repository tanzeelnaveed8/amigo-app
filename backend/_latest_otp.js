require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const otp = await db.collection('otps').find({ phone: '919971645229' }).sort({ expiresAt: -1 }).limit(1).toArray();
  if (otp.length > 0) {
    console.log('LATEST OTP:', otp[0].code, '| Expires:', otp[0].expiresAt);
  } else {
    console.log('No OTP found');
  }
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
