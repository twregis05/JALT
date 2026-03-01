const express = require('express');
const axios = require('axios');

const router = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.get('/', async (_req, res) => {
  res.render("dashboard");
});

// POST /api/ml/predict
router.post('/predict', async (req, res) => {
  try {
    // Frontend sends: { series_id: 'UNRATE'|'DPRIME', years: 1-5 }
    const series_id = req.body.series_id || 'UNRATE';
    const years = parseInt(req.body.years) || 5;
    const steps = years * 12; // Convert years to months for the ARIMA model

    const { data: prediction } = await axios.post(`${ML_URL}/predict`, { series_id, steps });

    // Flask returns: { forecast: [{ date, value }, ...] }
    // Aggregate monthly values into yearly averages to match the chart's x-axis
    const allValues = prediction.forecast.map(point => point.value);
    const yearlyValues = Array.from({ length: years }, (_, year) => {
      const slice = allValues.slice(year * 12, (year + 1) * 12);
      return parseFloat((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2));
    });
    res.json(yearlyValues);
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.error || 'ML service unavailable';
    res.status(status).json({ message });
  }
});

module.exports = router;
