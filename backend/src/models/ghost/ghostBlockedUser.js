const mongoose = require("mongoose");

const ghostBlockedUserSchema = new mongoose.Schema({
  crowdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostCrowd',
    required: true
  },
  blockerDeviceId: {
    type: String,
    required: true,
    trim: true
  },
  blockedDeviceId: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate blocks and optimize queries
ghostBlockedUserSchema.index({ crowdId: 1, blockerDeviceId: 1, blockedDeviceId: 1 }, { unique: true });
ghostBlockedUserSchema.index({ crowdId: 1, blockerDeviceId: 1 });

const GhostBlockedUser = mongoose.model('GhostBlockedUser', ghostBlockedUserSchema);

module.exports = GhostBlockedUser;
