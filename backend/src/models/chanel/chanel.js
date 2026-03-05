const mongoose = require("mongoose");

const chanel = new mongoose.Schema({
    chanelType: {
        type: String  // Private Group || Public Group
    },
    chanelAdmin: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userCredentialDB'
        }
    ],
    title: {
        type: String
    },
    username: {
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
    chanelProfile: {
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


const chanelDB = mongoose.model('chanelDB', chanel)
module.exports = chanelDB