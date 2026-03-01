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
    const { data: prediction } = await axios.post(`${ML_URL}/predict`, req.body);
    res.json(prediction);
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.error || 'ML service unavailable';
    res.status(status).json({ message });
  }
});

module.exports = router;
