const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

// Load backend/.env no matter where the process is started from.
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securechain';
let mongoReady = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    mongoReady = true;
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    mongoReady = false;
    console.error('MongoDB connection error:', err.message);
    console.log('Running in demo mode without database');
  });

mongoose.connection.on('disconnected', () => { mongoReady = false; });
mongoose.connection.on('connected', () => { mongoReady = true; });

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const verifyRoutes = require('./routes/verify');
const auditRoutes = require('./routes/audit');
const threatRoutes = require('./routes/threat');
const simulateRoutes = require('./routes/simulate');
const toolsRoutes = require('./routes/tools');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/tools', toolsRoutes);

// Friendly root message so users know the backend is running.
app.get('/', (req, res) => {
  res.json({
    name: 'SecureChain Backend',
    health: '/api/health',
    docs: 'Use /api/* endpoints. Most endpoints require Authorization: Bearer <token>.'
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: mongoReady ? 'connected' : 'disconnected'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const ports = [3000, 3001, 3002];
let actualPort;

const findFreePort = (ports) => {
  return new Promise((resolve) => {
    let attempted = 0;
    const tryPort = (port) => {
      const server = app.listen(port, () => {
        actualPort = port;
        server.close();
        resolve(port);
      });
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempted++;
          if (attempted < ports.length) {
            tryPort(ports[attempted]);
          } else {
            resolve(null);
          }
        }
      });
    };
    tryPort(port);
  });
};

(async () => {
  actualPort = process.env.PORT ? parseInt(process.env.PORT) : await findFreePort(ports);
  if (!actualPort) {
    console.error('No free ports available in [3000, 3001, 3002]');
    process.exit(1);
  }
  
  app.listen(actualPort, () => {
    console.log(`SecureChain Backend running on port ${actualPort}`);
  });
})();

module.exports = app;

module.exports = app;
