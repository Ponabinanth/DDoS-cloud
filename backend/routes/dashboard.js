const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const Audit = require('../models/Audit');
const Threat = require('../models/Threat');

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const verifiedFiles = await File.countDocuments({ verified: true });
    const recentFiles = await File.find().sort({ uploadedAt: -1 }).limit(5).populate('uploadedBy', 'name');
    const totalThreats = await Threat.countDocuments();
    const criticalThreats = await Threat.countDocuments({ severity: 'CRITICAL' });
    const blockedThreats = await Threat.countDocuments({ status: 'BLOCKED' });
    const recentActivities = await Audit.find().sort({ timestamp: -1 }).limit(10).populate('user', 'name');
    
    res.json({
      stats: { totalFiles, verifiedFiles, totalThreats, criticalThreats, blockedThreats },
      recentFiles,
      recentActivities,
      blockchainStats: { totalTransactions: await File.countDocuments({ blockchainTxHash: { $exists: true } }), networkStatus: 'connected' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
