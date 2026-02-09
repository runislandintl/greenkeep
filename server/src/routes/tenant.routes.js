const express = require('express');
const router = express.Router();
const tenantService = require('../services/tenant.service');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { ROLES } = require('../../../shared/constants');
const { tenantSchema, paginationSchema } = require('../../../shared/validation');

// All tenant routes require superadmin
router.use(authenticate, authorize(ROLES.SUPERADMIN));

// GET /api/v1/tenants
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await tenantService.listTenants(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/tenants
router.post('/', validate(tenantSchema), async (req, res, next) => {
  try {
    const tenant = await tenantService.createTenant(req.body);
    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tenants/:id
router.get('/:id', async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.params.id);
    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/tenants/:id
router.put('/:id', async (req, res, next) => {
  try {
    const tenant = await tenantService.updateTenant(req.params.id, req.body);
    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/tenants/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await tenantService.deactivateTenant(req.params.id);
    res.json({ message: 'Tenant deactivated' });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tenants/:id/users
router.get('/:id/users', async (req, res, next) => {
  try {
    const result = await tenantService.listTenantUsers(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/tenants/:id/users
router.post('/:id/users', async (req, res, next) => {
  try {
    const authService = require('../services/auth.service');
    const user = await authService.register({
      ...req.body,
      tenantId: req.params.id,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
