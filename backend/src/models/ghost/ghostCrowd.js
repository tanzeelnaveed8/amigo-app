const mongoose = require("mongoose");

const ghostCrowdSchema = new mongoose.Schema({
  crowdName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 50,
    match: [/^[a-z0-9-]+$/, "Crowd name must contain only lowercase letters, numbers, and hyphens"]
  },
  creatorDeviceId: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    enum: [1, 3, 7, 15, 31],
    default: 1
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isChatLocked: {
    type: Boolean,
    default: false
  },
  pinnedMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostMessage',
    default: null
  },
  /** Device IDs blocked from rejoining (e.g. after admin "Block Member") */
  blockedDeviceIds: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

// Indexes for performance
ghostCrowdSchema.index({ crowdName: 1 }, { unique: true });
ghostCrowdSchema.index({ expiresAt: 1 });
ghostCrowdSchema.index({ creatorDeviceId: 1 });
ghostCrowdSchema.index({ isActive: 1 });

// Pre-save middleware to calculate expiresAt if not provided
ghostCrowdSchema.pre('save', function(next) {
  if (!this.expiresAt && this.duration) {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + this.duration * 24 * 60 * 60 * 1000);
  }
  next();
});

const GhostCrowd = mongoose.model('GhostCrowd', ghostCrowdSchema);

module.exports = GhostCrowd;


