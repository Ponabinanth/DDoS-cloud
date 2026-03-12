const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Audit = require('../models/Audit');

// Get audit logs (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, eventType } = req.query;
    const query = eventType ? { eventType } : {};
    
    const logs = await Audit.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    const total = await Audit.countDocuments(query);
    
    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get user activity
router.get('/my-activity', auth, async (req, res) => {
  try {
    const logs = await Audit.find({ user: req.user._id }).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;
