const mongoose = require('mongoose');


const contactList = new mongoose.Schema({
    userId: {
        type: String
    },
    contactNum: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userCredentialDB',
        }
    ]
}, { timestamps: true })

const contactListDB = mongoose.model('contactListDB', contactList)

module.exports = contactListDB