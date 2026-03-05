require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const otps = await db.collection('otps').find(
    { phone: { $in: ['919971645229', '9971645229'] } }
  ).sort({ createdAt: -1 }).toArray();

  if (otps.length > 0) {
    console.log('OTPs found:');
    otps.forEach(o => console.log(`  Phone: ${o.phone} | Code: ${o.code} | Flow: ${o.flowType} | Expires: ${o.expiresAt}`));
  } else {
    console.log('No OTPs found for this number.');
  }

  // Also check all recent OTPs
  const recent = await db.collection('otps').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  console.log('\nRecent OTPs in DB:');
  recent.forEach(o => console.log(`  Phone: ${o.phone} | Code: ${o.code} | Flow: ${o.flowType} | Expires: ${o.expiresAt}`));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
