const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
   
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB', 
    
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB',
    
  },
  text: {
    type: String,
  },
  media:{
    type:String
  },
  seenTime:{
   type:String
  },
  seen:{
    type:Boolean,
    default:false
  },
  isDelete:{
    type:Boolean,
    default:false
  }
  
},{timestamps: true});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
