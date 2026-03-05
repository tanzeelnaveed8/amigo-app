const mongoose = require("mongoose");

const group = new mongoose.Schema({
    chatroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chatroom',
    },
    groupType: {
        type: String  // Private Group || Public Group
    },
    groupAdmin: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userCredentialDB'
        }
    ],
    title: {
        type: String
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userCredentialDB'
        }
    ],
    bio: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCredentialDB'
    },
    groupProfile: {
        type: String,
        default: ""
    },
    bannedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userCredentialDB'
        }
    ]

}, { timestamps: true })


const groupDB = mongoose.model('groupDB', group)
module.exports = groupDB