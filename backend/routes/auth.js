const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Audit = require('../models/Audit');
const { generateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Create audit log
    await Audit.create({
      eventType: 'LOGIN',
      description: `New user registered: ${email}`,
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Create audit log
    await Audit.create({
      eventType: 'LOGIN',
      description: `User logged in: ${email}`,
      user: user._id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Create audit log
    await Audit.create({
      eventType: 'LOGOUT',
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { token: token?.substring(0, 10) + '...' }
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

module.exports = router;
