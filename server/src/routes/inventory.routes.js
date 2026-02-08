const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventory.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const { ROLES } = require('@greenkeep/shared/constants');
const {
  inventoryItemSchema: itemValidation,
  inventoryMovementSchema: movementValidation,
  paginationSchema,
} = require('@greenkeep/shared/validation');

router.use(authenticate, tenantResolver, requireTenant, featureGate('inventory'));

// GET /api/v1/inventory
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await inventoryService.listItems(req.tenantDb, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inventory/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await inventoryService.getLowStockAlerts(req.tenantDb);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/inventory
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(itemValidation), async (req, res, next) => {
  try {
    const item = await inventoryService.createItem(req.tenantDb, req.body, req.user._id);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inventory/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await inventoryService.getItemById(req.tenantDb, req.params.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/inventory/:id
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(itemValidation), async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(req.tenantDb, req.params.id, req.body, req.user._id);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/inventory/:id/movements
router.post('/:id/movements', validate(movementValidation), async (req, res, next) => {
  try {
    const result = await inventoryService.recordMovement(
      req.tenantDb, req.params.id, req.body, req.user._id
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/inventory/:id/movements
router.get('/:id/movements', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await inventoryService.getMovements(req.tenantDb, req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
