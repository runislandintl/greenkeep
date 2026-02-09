const express = require('express');
const router = express.Router();
const teamService = require('../services/team.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const { ROLES } = require('../../../shared/constants');
const { teamMemberSchema: teamMemberValidation, paginationSchema } = require('../../../shared/validation');

router.use(authenticate, tenantResolver, requireTenant, featureGate('team'));

// GET /api/v1/team
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await teamService.listMembers(req.tenantDb, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/team
router.post('/', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), validate(teamMemberValidation), async (req, res, next) => {
  try {
    const member = await teamService.createMember(req.tenantDb, req.body, req.user._id);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/team/:id
router.get('/:id', async (req, res, next) => {
  try {
    const member = await teamService.getMemberById(req.tenantDb, req.params.id);
    res.json(member);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/team/:id
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    const member = await teamService.updateMember(req.tenantDb, req.params.id, req.body, req.user._id);
    res.json(member);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/team/:id
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    await teamService.deactivateMember(req.tenantDb, req.params.id, req.user._id);
    res.json({ message: 'Team member deactivated' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/team/:id/availability
router.put('/:id/availability', async (req, res, next) => {
  try {
    const member = await teamService.updateAvailability(
      req.tenantDb, req.params.id, req.body, req.user._id
    );
    res.json(member);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/team/:id/time-entries
router.get('/:id/time-entries', async (req, res, next) => {
  try {
    const result = await teamService.getTimeEntries(req.tenantDb, req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/team/:id/clock-in
router.post('/:id/clock-in', async (req, res, next) => {
  try {
    const entry = await teamService.clockIn(req.tenantDb, req.params.id, req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/team/:id/clock-out
router.put('/:id/clock-out', async (req, res, next) => {
  try {
    const entry = await teamService.clockOut(req.tenantDb, req.params.id, req.body);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
