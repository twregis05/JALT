const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';


router.get('/', async (req, res) => {
  res.render("dashboard");
}) 

// POST /api/ml/predict  (protected)
// Proxies the request to the Flask ML service and returns its JSON response.
router.post('/predict', protect, async (req, res) => {
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
