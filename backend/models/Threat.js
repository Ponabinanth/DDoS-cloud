const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  attackType: {
    type: String,
    required: true,
    enum: ['DDoS', 'MALWARE', 'PHISHING', 'BRUTE_FORCE', 'SQL_INJECTION', 'XSS', 'RANSOMWARE']
  },
  sourceIP: {
    type: String
  },
  sourceCountry: {
    type: String
  },
  sourceCoordinates: {
    lat: Number,
    lng: Number
  },
  targetIP: {
    type: String
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['DETECTED', 'BLOCKED', 'ANALYZED'],
    default: 'DETECTED'
  },
  description: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Threat', threatSchema);
