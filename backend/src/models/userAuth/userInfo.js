const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB',
  },
  userMoreData: [], // phone,email
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  bio: {
    type: String
  },
  userName: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  authType: {
    type: String  // 'phone' or 'bot'
  },
  isPhoneVisible: {
    type: Boolean,
    default: false
  },
  isNotificationEnable: {
    type: Boolean,
    default: false
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  userProfile: {
    type: String,
    default: 'https://t4.ftcdn.net/jpg/05/11/55/91/360_F_511559113_UTxNAE1EP40z1qZ8hIzGNrB0LwqwjruK.jpg'
  },
  userAccountType: {
    type: String  //  
  }


}, { timestamps: true })

const userInfoDB = mongoose.model('userInfoDB', userInfoSchema)
module.exports = userInfoDB