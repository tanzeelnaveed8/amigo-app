require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  // Find users with invite codes
  const users = await db.collection('usercredentials').find(
    { inviteCode: { $exists: true, $ne: null } },
    { projection: { inviteCode: 1, canInvite: 1, registrationType: 1, invitesUsed: 1, phone: 1, userName: 1 } }
  ).toArray();

  if (users.length > 0) {
    console.log('Users with invite codes:');
    users.forEach(u => console.log(`  Phone: ${u.phone} | Code: ${u.inviteCode} | canInvite: ${u.canInvite} | type: ${u.registrationType} | used: ${u.invitesUsed || 0}`));
  } else {
    console.log('No users have invite codes yet.');
  }

  // Find the unlimited invite phone users
  const admins = await db.collection('usercredentials').find(
    { phone: { $in: ['919971645229', '918076254682'] } },
    { projection: { inviteCode: 1, canInvite: 1, registrationType: 1, invitesUsed: 1, phone: 1, userName: 1 } }
  ).toArray();

  console.log('\nAdmin/Unlimited users:');
  admins.forEach(u => console.log(`  Phone: ${u.phone} | Code: ${u.inviteCode || 'NONE'} | canInvite: ${u.canInvite} | type: ${u.registrationType}`));

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
