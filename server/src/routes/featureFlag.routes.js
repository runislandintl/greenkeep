const express = require('express');
const router = express.Router();
const featureFlagService = require('../services/featureFlag.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const validate = require('../middleware/validator');
const { ROLES } = require('@greenkeep/shared/constants');
const { featureFlagUpdateSchema } = require('@greenkeep/shared/validation');

router.use(authenticate, tenantResolver, requireTenant);

// GET /api/v1/feature-flags
router.get('/', async (req, res, next) => {
  try {
    const flags = await featureFlagService.getFlags(req.tenant._id);
    res.json(flags);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/feature-flags
router.put(
  '/',
  authorize(ROLES.SUPERADMIN),
  validate(featureFlagUpdateSchema),
  async (req, res, next) => {
    try {
      const flags = await featureFlagService.updateFlags(req.tenant._id, req.body);
      res.json(flags);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
