const mongoose = require("mongoose");

const ghostMessageSchema = new mongoose.Schema({
  crowdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostCrowd',
    required: true
  },
  senderDeviceId: {
    type: String,
    required: true,
    trim: true
  },
  senderGhostName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  media: {
    type: String,
    default: null,
    trim: true
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
ghostMessageSchema.index({ crowdId: 1, createdAt: -1 });
ghostMessageSchema.index({ crowdId: 1 });
ghostMessageSchema.index({ senderDeviceId: 1 });

const GhostMessage = mongoose.model('GhostMessage', ghostMessageSchema);

module.exports = GhostMessage;


