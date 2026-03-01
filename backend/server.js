require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── Connect to MongoDB Atlas ────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected live to the cloud!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Middleware ────────────────────────────────
app.use(cors()); 
app.use(express.json()); 

// ── Routes ────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/ml', require('./routes/ml')); // Uncomment this later when we build the ML route!

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────
const PORT = 4000; 
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));