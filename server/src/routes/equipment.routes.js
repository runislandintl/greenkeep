const express = require('express');
const router = express.Router();
const equipmentService = require('../services/equipment.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const { ROLES } = require('@greenkeep/shared/constants');
const { equipmentSchema: equipmentValidation, paginationSchema } = require('@greenkeep/shared/validation');

router.use(authenticate, tenantResolver, requireTenant, featureGate('equipment'));

// GET /api/v1/equipment
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await equipmentService.listEquipment(req.tenantDb, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/equipment
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(equipmentValidation), async (req, res, next) => {
  try {
    const equipment = await equipmentService.createEquipment(req.tenantDb, req.body, req.user._id);
    res.status(201).json(equipment);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/equipment/:id
router.get('/:id', async (req, res, next) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.tenantDb, req.params.id);
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/equipment/:id
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(equipmentValidation), async (req, res, next) => {
  try {
    const equipment = await equipmentService.updateEquipment(
      req.tenantDb, req.params.id, req.body, req.user._id
    );
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/equipment/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const equipment = await equipmentService.updateEquipmentStatus(
      req.tenantDb, req.params.id, status, req.user._id
    );
    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/equipment/:id
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    await equipmentService.deleteEquipment(req.tenantDb, req.params.id, req.user._id);
    res.json({ message: 'Equipment deactivated' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
