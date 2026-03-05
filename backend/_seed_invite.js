require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  // Find any existing user
  const anyUser = await db.collection('usercredentials').findOne({ isDeleted: 0 });

  if (anyUser) {
    // Give this user an invite code
    await db.collection('usercredentials').updateOne(
      { _id: anyUser._id },
      { $set: { inviteCode: 'TEST1234', canInvite: true, registrationType: 'invite', invitesUsed: 0 } }
    );
    console.log(`Invite code set for user: ${anyUser.userName || anyUser.phone}`);
    console.log(`\n  INVITE CODE: TEST1234\n`);
    console.log('Use this code in the app to register.');
  } else {
    console.log('No users in DB. Creating a seed user with invite code...');
    await db.collection('usercredentials').insertOne({
      phone: '919971645229',
      firstName: 'Admin',
      lastName: 'User',
      userName: 'admin_amigo',
      inviteCode: 'TEST1234',
      canInvite: true,
      registrationType: 'invite',
      invitesUsed: 0,
      isDeleted: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Seed user created.');
    console.log(`\n  INVITE CODE: TEST1234\n`);
    console.log('Use this code in the app to register.');
  }

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
