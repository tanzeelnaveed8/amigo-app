const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  chatRoomType: {
    type: String  // Group || OneToOne
},
  name: {
    type: String,
    required: true
  },
  participants:[],
  blockedUser:[],
 
  
},{timestamps: true});

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;
