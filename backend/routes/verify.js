const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const Audit = require('../models/Audit');

// Generate hash from file buffer
const generateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Verify file by uploading
router.post('/file', auth, require('multer')().single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileHash = generateHash(req.file.buffer);
    const storedFile = await File.findOne({ hash: fileHash });

    await Audit.create({
      eventType: 'VERIFY',
      description: `File verification attempted: ${req.file.originalname}`,
      user: req.user._id,
      ipAddress: req.ip,
      metadata: { hash: fileHash, result: storedFile ? 'MATCH' : 'NO_MATCH' }
    });

    if (storedFile) {
      storedFile.verified = true;
      storedFile.lastVerified = new Date();
      await storedFile.save();
      
      return res.json({
        verified: true,
        message: 'File is authentic and verified on blockchain',
        file: { originalName: storedFile.originalName, hash: storedFile.hash, uploadedAt: storedFile.uploadedAt, blockchainTxHash: storedFile.blockchainTxHash }
      });
    }

    res.json({ verified: false, message: 'File not found in blockchain. May be tampered or not registered.' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Verify by hash
router.post('/hash', auth, async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ error: 'Hash required' });
    }

    const storedFile = await File.findOne({ hash });
    
    await Audit.create({
      eventType: 'VERIFY',
      description: `Hash verification: ${hash}`,
      user: req.user._id,
      metadata: { hash, result: storedFile ? 'FOUND' : 'NOT_FOUND' }
    });

    if (storedFile) {
      return res.json({ verified: true, message: 'Hash verified on blockchain', file: storedFile });
    }
    
    res.json({ verified: false, message: 'Hash not found in blockchain' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
