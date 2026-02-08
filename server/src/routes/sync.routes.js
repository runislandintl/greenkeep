const express = require('express');
const router = express.Router();
const syncService = require('../services/sync.service');
const { authenticate } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');

router.use(authenticate, tenantResolver, requireTenant);

// POST /api/v1/sync/pull
router.post('/pull', async (req, res, next) => {
  try {
    const { lastSyncVersions } = req.body;
    const changes = await syncService.pullChanges(req.tenantDb, lastSyncVersions || {});
    res.json(changes);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/sync/push
router.post('/push', async (req, res, next) => {
  try {
    const { changes } = req.body;
    if (!changes) {
      return res.status(400).json({ error: 'changes object required' });
    }
    const results = await syncService.pushChanges(req.tenantDb, changes, req.user._id);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
