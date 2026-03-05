/**
 * Seed script: 03202834184 ke liye user, contacts, DM conversations aur unread messages add karta hai.
 * Run: node _seed_dm_03202834184.js (backend folder se)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/connectDb');
const userCredentialDB = require('./src/models/userAuth/userCredential');
const contactListDB = require('./src/models/userChat/userContactList');
const { ConversationModel, MessageModel } = require('./src/models/userChat/ConversationModel');

const TARGET_PHONE = '03202834184';
const TARGET_PHONE_ALT = '923202834184';

// 2 fake contacts (agar DB me nahi milenge to create karenge)
const FAKE_CONTACTS = [
  { phone: '03001234567', firstName: 'Ali', lastName: 'Khan', userName: 'ali_khan_seed' },
  { phone: '03309876543', firstName: 'Sara', lastName: 'Ahmed', userName: 'sara_ahmed_seed' },
];

async function findOrCreateUser(phone, altPhone, payload = {}) {
  let u = await userCredentialDB.findOne({ phone });
  if (!u && altPhone) u = await userCredentialDB.findOne({ phone: altPhone });
  if (u) return u;
  return await userCredentialDB.create({
    phone: payload.phone || phone,
    firstName: payload.firstName || 'User',
    lastName: payload.lastName || 'Seed',
    userName: payload.userName || `user_${phone}`,
    isDeleted: 0,
    ...payload,
  });
}

async function run() {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB connect fail:', e.message);
    process.exit(1);
  }

  const mainUser = await findOrCreateUser(TARGET_PHONE, TARGET_PHONE_ALT, {
    phone: TARGET_PHONE,
    firstName: 'Tanzeel',
    lastName: 'User',
    userName: 'tanzeel_03202834184',
  });
  console.log('Main user:', mainUser.phone, mainUser._id.toString());

  const contactUsers = [];
  for (const c of FAKE_CONTACTS) {
    const u = await findOrCreateUser(c.phone, null, c);
    contactUsers.push(u);
    console.log('Contact:', u.phone, u._id.toString());
  }

  const mainId = mainUser._id;
  const mainIdStr = mainId.toString();

  // Contact list: 03202834184 ke contacts me ye dono add karo
  let contactList = await contactListDB.findOne({ userId: mainIdStr });
  const contactIds = contactUsers.map((u) => u._id);
  if (!contactList) {
    contactList = await contactListDB.create({
      userId: mainIdStr,
      contactNum: contactIds,
    });
    console.log('Contact list created for', TARGET_PHONE);
  } else {
    for (const id of contactIds) {
      if (!contactList.contactNum.some((c) => c.toString() === id.toString())) {
        contactList.contactNum.push(id);
      }
    }
    await contactList.save();
    console.log('Contact list updated for', TARGET_PHONE);
  }

  // Har contact ke sath DM conversation + messages (kuch unread)
  for (const other of contactUsers) {
    const otherId = other._id;
    let conv = await ConversationModel.findOne({
      participents: { $all: [mainId, otherId] },
      conversationType: 'dm',
    });
    if (!conv) {
      conv = await ConversationModel.create({
        participents: [mainId, otherId],
        conversationType: 'dm',
      });
      console.log('DM conversation created:', mainIdStr, '<->', otherId.toString());
    }

    const existingInConv = conv.messages && conv.messages.length;
    if (existingInConv && existingInConv >= 3) {
      console.log('Conversation already has messages, skipping message seed.');
      continue;
    }

    const messagesToAdd = [
      { text: 'Hi, kaise ho?', msgByUserId: otherId, seen: false },
      { text: 'Main theek hoon. Tum batao?', msgByUserId: mainId, seen: true },
      { text: 'Yeh test message hai – unread dikhna chahiye.', msgByUserId: otherId, seen: false },
      { text: 'Theek hai, dekhte hain app me.', msgByUserId: mainId, seen: true },
      { text: 'Last unread message.', msgByUserId: otherId, seen: false },
    ];

    for (const m of messagesToAdd) {
      const msg = await MessageModel.create({
        text: m.text,
        msgByUserId: m.msgByUserId,
        seen: m.seen,
      });
      await ConversationModel.updateOne(
        { _id: conv._id },
        { $push: { messages: msg._id } }
      );
    }
    console.log('Messages added for contact', other.phone);
  }

  console.log('\nDone. 03202834184 ke liye contacts, DMs aur unread messages add ho chuke hain.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
