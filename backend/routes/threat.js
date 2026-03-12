const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Threat = require('../models/Threat');

// Get all threats
router.get('/', auth, async (req, res) => {
  try {
    const { severity, status, limit = 50 } = req.query;
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    
    const threats = await Threat.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

// Get threat statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      total: await Threat.countDocuments(),
      critical: await Threat.countDocuments({ severity: 'CRITICAL' }),
      high: await Threat.countDocuments({ severity: 'HIGH' }),
      medium: await Threat.countDocuments({ severity: 'MEDIUM' }),
      low: await Threat.countDocuments({ severity: 'LOW' }),
      blocked: await Threat.countDocuments({ status: 'BLOCKED' })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threat stats' });
  }
});

// Get threats by country
router.get('/by-country', auth, async (req, res) => {
  try {
    const threats = await Threat.aggregate([
      { $group: { _id: '$sourceCountry', count: { $sum: 1 }, critical: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

module.exports = router;
