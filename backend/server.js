require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');          
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB ────────────────────────
connectDB();

// ── Middleware ────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── View engine ───────────────────────────────
app.set('view engine', 'ejs');

// go from backend → project root → frontend/templates
app.set('views', path.join(__dirname, '../frontend/templates'));

// static files (css, images, etc.)
app.use(express.static(path.join(__dirname, '../frontend/style')));

// ── Routes ────────────────────────────────────
const login = require("./routes/login");
const signup = require("./routes/signup");
const ml = require("./routes/ml")

app.use("/", login);
app.use("/signup", signup);
app.use("/ml", ml);


// ── Health check ──────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Web server is running at http://localhost:${PORT}`));