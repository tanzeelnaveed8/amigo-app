const mongoose = require("mongoose");

const ghostMemberSchema = new mongoose.Schema({
  crowdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostCrowd',
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  ghostName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatarBgColor: {
    type: String,
    required: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Avatar color must be a valid hex color"]
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  mutedUntil: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate members in same crowd
ghostMemberSchema.index({ crowdId: 1, deviceId: 1 }, { unique: true });
ghostMemberSchema.index({ crowdId: 1 });
ghostMemberSchema.index({ deviceId: 1 });

const GhostMember = mongoose.model('GhostMember', ghostMemberSchema);

module.exports = GhostMember;





