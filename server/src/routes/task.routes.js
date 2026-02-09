const express = require('express');
const router = express.Router();
const taskService = require('../services/task.service');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantResolver, requireTenant } = require('../middleware/tenantResolver');
const featureGate = require('../middleware/featureGate');
const validate = require('../middleware/validator');
const { ROLES } = require('../../../shared/constants');
const { taskSchema, taskStatusUpdateSchema, paginationSchema } = require('../../../shared/validation');

router.use(authenticate, tenantResolver, requireTenant, featureGate('tasks'));

// GET /api/v1/tasks
router.get('/', validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await taskService.listTasks(req.tenantDb, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tasks/calendar
router.get('/calendar', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query params required' });
    }
    const tasks = await taskService.getTasksCalendar(req.tenantDb, startDate, endDate);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tasks/today
router.get('/today', async (req, res, next) => {
  try {
    const tasks = await taskService.getTodayTasks(req.tenantDb, req.user._id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/tasks
router.post('/', validate(taskSchema), async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.tenantDb, req.body, req.user._id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/tasks/from-template
router.post('/from-template', async (req, res, next) => {
  try {
    const { templateId, ...overrides } = req.body;
    if (!templateId) {
      return res.status(400).json({ error: 'templateId required' });
    }
    const task = await taskService.createTaskFromTemplate(
      req.tenantDb, templateId, overrides, req.user._id
    );
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.tenantDb, req.params.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/tasks/:id
router.put('/:id', validate(taskSchema), async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.tenantDb, req.params.id, req.body, req.user._id);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/tasks/:id/status
router.put('/:id/status', validate(taskStatusUpdateSchema), async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(
      req.tenantDb, req.params.id, req.body, req.user._id
    );
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await taskService.cancelTask(req.tenantDb, req.params.id, req.user._id);
    res.json({ message: 'Task cancelled' });
  } catch (error) {
    next(error);
  }
});

// ---- Task Templates ----

// GET /api/v1/tasks/templates (must come before /:id)
router.get('/templates/list', async (req, res, next) => {
  try {
    const templates = await taskService.listTemplates(req.tenantDb);
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.post('/templates', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    const template = await taskService.createTemplate(req.tenantDb, req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

router.put('/templates/:templateId', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    const template = await taskService.updateTemplate(req.tenantDb, req.params.templateId, req.body);
    res.json(template);
  } catch (error) {
    next(error);
  }
});

router.delete('/templates/:templateId', authorize(ROLES.ADMIN, ROLES.SUPERADMIN), async (req, res, next) => {
  try {
    await taskService.deleteTemplate(req.tenantDb, req.params.templateId);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
