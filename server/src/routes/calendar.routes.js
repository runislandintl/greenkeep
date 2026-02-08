const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendar.service');
const { authenticate } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');

router.use(authenticate, tenantResolver, requireTenant, featureGate('calendar'));

// GET /api/v1/calendar/auth-url
router.get('/auth-url', (req, res, next) => {
  try {
    const url = calendarService.getAuthUrl();
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/calendar/callback
router.post('/callback', async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }
    const tokens = await calendarService.exchangeCode(code);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/calendar/sync
router.post('/sync', async (req, res, next) => {
  try {
    const { accessToken, tasks } = req.body;
    if (!accessToken || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'accessToken and tasks[] required' });
    }

    const results = [];
    for (const task of tasks) {
      try {
        const event = await calendarService.createEvent(accessToken, task, req.tenant);
        results.push({ taskId: task._id, eventId: event.id, status: 'success' });
      } catch (error) {
        results.push({ taskId: task._id, status: 'error', message: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
