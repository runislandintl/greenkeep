const express = require('express');
const router = express.Router();
const weatherService = require('../services/weather.service');
const { authenticate } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');

router.use(authenticate, tenantResolver, requireTenant, featureGate('weather'));

// GET /api/v1/weather/current
router.get('/current', async (req, res, next) => {
  try {
    const { lat, lng } = req.query.lat
      ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) }
      : req.tenant.settings.weatherLocation || req.tenant.settings.mapCenter;

    const weather = await weatherService.getCurrentWeather(req.tenantDb, lat, lng);
    res.json(weather);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/weather/forecast
router.get('/forecast', async (req, res, next) => {
  try {
    const { lat, lng } = req.query.lat
      ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) }
      : req.tenant.settings.weatherLocation || req.tenant.settings.mapCenter;

    const forecast = await weatherService.getForecast(req.tenantDb, lat, lng);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
