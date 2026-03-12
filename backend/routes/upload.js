const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const File = require('../models/File');
const Audit = require('../models/Audit');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Generate SHA-256 hash
const generateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Upload file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileHash = generateHash(req.file.buffer);
    
    // Simulate blockchain transaction hash
    const blockchainTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      hash: fileHash,
      blockchainTxHash,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    await file.save();

    await Audit.create({
      eventType: 'UPLOAD',
      description: `File uploaded: ${req.file.originalname}`,
      user: req.user._id,
      ipAddress: req.ip,
      metadata: { fileId: file._id, hash: fileHash, size: req.file.size }
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.originalName,
        hash: file.hash,
        blockchainTxHash: file.blockchainTxHash,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get user's files
router.get('/myfiles', auth, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router;
