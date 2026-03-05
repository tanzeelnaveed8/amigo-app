const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: String,
  email: String,
  code: String,
  expiresAt: Date,
  flowType: {
    type: String,
    enum: ['login', 'register'],
    default: 'register'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB',
    required: false
  }
});

module.exports = mongoose.model('OTP', otpSchema);