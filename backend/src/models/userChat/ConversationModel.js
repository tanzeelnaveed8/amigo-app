const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    },
    audioUrl: {
        type: String,
        default: ""
    },
    docUrl: {
        type: String,
        default: ""
    },
    seen: {
        type: Boolean,
        default: false
    },
    seenByUsers: [{ type: mongoose.Schema.ObjectId, ref: 'userCredentialDB' }],  // List of users who saw the message
    seenByCount: { type: Number, default: 0 },  // Count of unique viewers
    msgByUserId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'userCredentialDB'
    },
    replyMessage: {
        type: String,
        default: ""
    },
    reactions: [
        {
            userId: [{ type: mongoose.Schema.ObjectId, ref: 'userCredentialDB' }],
            emoji: String,
            emojiCount: Number
        }
    ],
    likesDislikes: [{
        action: {
            type: String,
            enum: ['like', 'dislike']
        },
        userId: [mongoose.Schema.Types.ObjectId],
        count: Number
    }]

}, {
    timestamps: true
})

const conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,

        ref: 'userCredentialDB'
    },
    receiver: {
        type: mongoose.Schema.ObjectId,

        ref: 'userCredentialDB'
    },
    participents: [
        {
            type: mongoose.Schema.ObjectId,

            ref: 'userCredentialDB'
        }
    ],
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Messagedata'
        }
    ],
    groupId: {
        type: mongoose.Schema.ObjectId,
        ref: 'groupDB',

    },
    chanelId: {
        type: mongoose.Schema.ObjectId,
        ref: 'chanelDB',

    },
    blockUser: [
        {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'userCredentialDB'
        }
    ],
    conversationType: {
        type: String,  // group || chanel
        default: 'dm'
    },
    unseenMsg: {
        type: Number
    }
}, {
    timestamps: true
})

const MessageModel = mongoose.model('Messagedata', messageSchema)
const ConversationModel = mongoose.model('Conversation', conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}