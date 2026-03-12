const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'UPLOAD', 'VERIFY', 'DELETE', 'ADMIN_ACTION']
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Audit', auditSchema);
