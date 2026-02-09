const express = require('express');
const router = express.Router();
const sensorService = require('../services/sensor.service');
const { authenticate } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { sensorReadingBatchSchema } = require('../../../shared/validation');

// POST /api/v1/sensors/readings - Uses API key auth (for IoT devices)
router.post('/readings', async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== env.sensor.apiKey) {
      throw ApiError.unauthorized('Invalid sensor API key');
    }

    const tenantSlug = req.headers['x-tenant-slug'];
    if (!tenantSlug) {
      throw ApiError.badRequest('x-tenant-slug header required');
    }

    const { getTenantDb } = require('../config/database');
    const tenantDb = getTenantDb(tenantSlug);

    const { error, value } = sensorReadingBatchSchema.validate(req.body);
    if (error) {
      throw ApiError.badRequest('Validation failed', error.details.map((d) => d.message));
    }

    const result = await sensorService.ingestReadings(tenantDb, value.readings);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Authenticated routes below
router.use(authenticate, tenantResolver, requireTenant, featureGate('iot'));

// GET /api/v1/sensors/:sensorId/readings
router.get('/:sensorId/readings', async (req, res, next) => {
  try {
    const readings = await sensorService.getSensorReadings(
      req.tenantDb, req.params.sensorId, req.query
    );
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sensors/zones/:zoneId
router.get('/zones/:zoneId', async (req, res, next) => {
  try {
    const readings = await sensorService.getZoneReadings(
      req.tenantDb, req.params.zoneId, req.query
    );
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/sensors/zones/:zoneId/latest
router.get('/zones/:zoneId/latest', async (req, res, next) => {
  try {
    const readings = await sensorService.getLatestZoneReadings(
      req.tenantDb, req.params.zoneId
    );
    res.json(readings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
