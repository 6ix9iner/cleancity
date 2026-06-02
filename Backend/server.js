// Force Node.js DNS resolver to use Google and Cloudflare DNS to prevent queryTxt ETIMEOUT
try {
  require('dns').setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('Failed to set DNS servers:', dnsErr.message);
}

// Load environment variables with a safe fallback if `dotenv` can't be resolved
try {
  require('dotenv').config();
} catch (e) {
  try {
    // Fallback to local node_modules path if package resolution is problematic
    require('./node_modules/dotenv').config();
  } catch (err) {
    console.warn('dotenv not available; continuing without loading .env file');
  }
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const agencyRoutes = require('./routes/agencies');
const rewardRoutes = require('./routes/rewards');

const app = express();

// Connect to MongoDB
connectDB();

// ── Core Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Clean City Nigeria API is running' });
});

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/rewards', rewardRoutes);

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (MUST be last, after all routes) ─────────
// Express identifies error middleware by the 4-argument signature
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Global error:', err.stack || err.message);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});