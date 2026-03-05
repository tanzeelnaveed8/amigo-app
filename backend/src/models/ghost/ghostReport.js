const mongoose = require("mongoose");

const ghostReportSchema = new mongoose.Schema({
  crowdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostCrowd',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['crowd', 'message']
  },
  reporterDeviceId: {
    type: String,
    default: null,
    trim: true
  },
  reasonKey: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    default: null,
    trim: true,
    maxlength: 500
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GhostMessage',
    default: null
  },
  reportedUserDeviceId: {
    type: String,
    default: null,
    trim: true
  },
  reportedUserGhostName: {
    type: String,
    default: null,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
});

ghostReportSchema.index({ crowdId: 1, createdAt: -1 });
ghostReportSchema.index({ reportType: 1 });
ghostReportSchema.index({ createdAt: -1 });

const GhostReport = mongoose.model('GhostReport', ghostReportSchema);

module.exports = GhostReport;
