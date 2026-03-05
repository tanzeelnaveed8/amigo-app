const mongoose = require('mongoose');

const walletItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['image', 'document'], required: true },
  sizeBytes: { type: Number, required: true },
  s3Key: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  iv: { type: String }, // AES-GCM IV (base64)
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const amigoWalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userCredentialDB',
    required: true,
    unique: true,
  },
  items: [walletItemSchema],
  totalSizeBytes: { type: Number, default: 0 },
}, { timestamps: true });

amigoWalletSchema.index({ userId: 1 });

const AmigoWalletDB = mongoose.model('AmigoWalletDB', amigoWalletSchema);
module.exports = AmigoWalletDB;
