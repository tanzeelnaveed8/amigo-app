const mongoose = require("mongoose");

const mediaScheam = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userCredentialDB',
    },
    mediaurl:{
        type:String
    },
    mediaType:{
        type:String  // image || video || audio || docs 
    }
}, { timestamps: true })

const mediaDB = mongoose.model('mediaDB', mediaScheam)
module.exports = mediaDB