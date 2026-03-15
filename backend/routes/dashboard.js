const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const Audit = require('../models/Audit');
const Threat = require('../models/Threat');

const buildDemoDashboard = () => ({
  stats: { totalFiles: 24, verifiedFiles: 20, totalThreats: 128, criticalThreats: 6, blockedThreats: 98 },
  recentFiles: [],
  recentActivities: [],
  blockchainStats: { totalTransactions: 20, networkStatus: 'demo' },
  timestamp: new Date().toISOString(),
  mode: 'demo'
});

const buildDemoMetrics = () => ({
  uptimeSeconds: Math.round(process.uptime()),
  activeUsers: Math.floor(5 + Math.random() * 20),
  anomalies: Math.floor(Math.random() * 10),
  blocked: Math.floor(50 + Math.random() * 50),
  cpuLoad: Math.round(10 + Math.random() * 40),
  timestamp: new Date().toISOString(),
  mode: 'demo'
});

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
    console.warn('Dashboard query failed, returning demo data:', error.message);
    res.json(buildDemoDashboard());
  }
});

// Lightweight metrics for widgets/charts
router.get('/metrics', auth, async (req, res) => {
  try {
    const threats = await Threat.countDocuments();
    const blocked = await Threat.countDocuments({ status: 'BLOCKED' });
    const critical = await Threat.countDocuments({ severity: 'CRITICAL' });

    res.json({
      uptimeSeconds: Math.round(process.uptime()),
      activeUsers: 12, // Replace with real session tracking when available
      anomalies: critical,
      blocked,
      threats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Metrics query failed, returning demo metrics:', error.message);
    res.json(buildDemoMetrics());
  }
});

module.exports = router;
