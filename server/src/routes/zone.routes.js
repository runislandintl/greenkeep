const express = require('express');
const router = express.Router();
const zoneService = require('../services/zone.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const { ROLES } = require('@greenkeep/shared/constants');
const { zoneSchema, zoneHealthUpdateSchema, paginationSchema } = require('@greenkeep/shared/validation');

router.use(authenticate, tenantResolver, requireTenant, featureGate('zones'));

// GET /api/v1/zones
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await zoneService.listZones(req.tenantDb, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/zones/map
router.get('/map', async (req, res, next) => {
  try {
    const geojson = await zoneService.getZonesGeoJSON(req.tenantDb);
    res.json(geojson);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/zones
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(zoneSchema), async (req, res, next) => {
  try {
    const zone = await zoneService.createZone(req.tenantDb, req.body, req.user._id);
    res.status(201).json(zone);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/zones/:id
router.get('/:id', async (req, res, next) => {
  try {
    const zone = await zoneService.getZoneById(req.tenantDb, req.params.id);
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/zones/:id
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(zoneSchema), async (req, res, next) => {
  try {
    const zone = await zoneService.updateZone(req.tenantDb, req.params.id, req.body, req.user._id);
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/zones/:id/health
router.put('/:id/health', validate(zoneHealthUpdateSchema), async (req, res, next) => {
  try {
    const zone = await zoneService.updateZoneHealth(req.tenantDb, req.params.id, req.body, req.user._id);
    res.json(zone);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/zones/:id
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    await zoneService.deleteZone(req.tenantDb, req.params.id, req.user._id);
    res.json({ message: 'Zone deactivated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
