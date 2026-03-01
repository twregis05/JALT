require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');          
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB Atlas ────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected live to the cloud!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── View engine ───────────────────────────────
app.set('view engine', 'ejs');

// go from backend → project root → frontend/templates
app.set('views', path.join(__dirname, '../frontend/templates'));

// static files (css, images, etc.)
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Routes ────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/ml', require('./routes/ml')); // Uncomment this later when we build the ML route!
const ml = require("./routes/ml");

app.use("/api/ml", ml);

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


// ── Health check ──────────────────────────────
app.get('/primeIntrestRate', async (req, res) => {
    try{
        const response = await fetch("https://api.stlouisfed.org/fred/series/observations?series_id=PRIME&api_key=94e1ccc9ecc0c33e1ad754a11491cda9&file_type=json&sort_order=desc&limit=1")
        const data = await response.json();
        res.json({ primeInterestRate: data.observations[0].value });
    }catch(err){
        console.error('Error fetching prime interest rate:', err.message);
        res.status(500).json({ error: 'Failed to fetch prime interest rate' });
    }
});

app.get('/unemployementRate', async (req, res) => {
    try{
        const response = await fetch("https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=94e1ccc9ecc0c33e1ad754a11491cda9&file_type=json&sort_order=desc&limit=1")
        const data = await response.json();
        res.json({ unemploymentRate: data.observations[0].value });
    }catch(err){
        console.error('Error fetching unemployment rate:', err.message);
        res.status(500).json({ error: 'Failed to fetch unemployment rate' });
    }
});

app.get('/inflationRate', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=13`
    );

    const data = await response.json();

    const latest = parseFloat(data.observations[0].value);
    const lastYear = parseFloat(data.observations[12].value);

    const inflationRate = (((latest / lastYear) - 1) * 100).toFixed(2);

    res.json({ inflationRate });
  } catch (err) {
    console.error('Error fetching inflation rate:', err.message);
    res.status(500).json({ error: 'Failed to fetch inflation rate' });
  }
});

app.get('/gdpGrowth', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=5`
    );

    const data = await response.json();

    const latest = parseFloat(data.observations[0].value);
    const lastYear = parseFloat(data.observations[4].value);

    const gdpGrowth = (((latest / lastYear) - 1) * 100).toFixed(2);

    res.json({ gdpGrowth });
  } catch (err) {
    console.error('Error fetching GDP growth:', err.message);
    res.status(500).json({ error: 'Failed to fetch GDP growth' });
  }
});



// ── Start ─────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
