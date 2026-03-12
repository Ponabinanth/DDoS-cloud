const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Threat = require('../models/Threat');
const Audit = require('../models/Audit');

// Simulate DDoS attack
router.post('/ddos', auth, adminAuth, async (req, res) => {
  try {
    const { targetIP, intensity = 'MEDIUM' } = req.body;
    
    const threat = new Threat({
      attackType: 'DDoS',
      targetIP: targetIP || '192.168.1.' + Math.floor(Math.random() * 255),
      sourceCountry: ['US', 'CN', 'RU', 'BR', 'IN'][Math.floor(Math.random() * 5)],
      severity: intensity,
      status: 'DETECTED',
      description: `DDoS simulation targeting ${targetIP || 'random IP'}`
    });
    
    await threat.save();
    
    await Audit.create({
      eventType: 'ADMIN_ACTION',
      description: `DDoS simulation executed: ${intensity} intensity`,
      user: req.user._id,
      metadata: { targetIP, intensity }
    });
    
    res.json({ message: 'DDoS simulation completed', threat });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// Simulate brute force attack
router.post('/brute-force', auth, adminAuth, async (req, res) => {
  try {
    const { targetIP } = req.body;
    
    const threat = new Threat({
      attackType: 'BRUTE_FORCE',
      sourceIP: '192.168.1.' + Math.floor(Math.random() * 255),
      sourceCountry: ['US', 'CN', 'RU'][Math.floor(Math.random() * 3)],
      targetIP: targetIP || '192.168.1.1',
      severity: 'HIGH',
      status: 'BLOCKED',
      description: 'Brute force attack detected and blocked'
    });
    
    await threat.save();
    
    await Audit.create({
      eventType: 'ADMIN_ACTION',
      description: 'Brute force simulation executed',
      user: req.user._id
    });
    
    res.json({ message: 'Brute force simulation completed', threat });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// Simulate malware detection
router.post('/malware', auth, adminAuth, async (req, res) => {
  try {
    const threat = new Threat({
      attackType: 'MALWARE',
      sourceCountry: ['US', 'DE', 'JP', 'UK'][Math.floor(Math.random() * 4)],
      severity: 'CRITICAL',
      status: 'DETECTED',
      description: 'Malware sample detected and quarantined'
    });
    
    await threat.save();
    
    await Audit.create({
      eventType: 'ADMIN_ACTION',
      description: 'Malware detection simulation executed',
      user: req.user._id
    });
    
    res.json({ message: 'Malware simulation completed', threat });
  } catch (error) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

module.exports = router;
