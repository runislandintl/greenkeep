const taskSchema = require('../models/Task');
const taskTemplateSchema = require('../models/TaskTemplate');
const auditLogSchema = require('../models/AuditLog');
const { TASK_STATUSES } = require('@greenkeep/shared/constants');
const ApiError = require('../utils/apiError');

function getTaskModel(tenantDb) {
  return tenantDb.model('Task', taskSchema);
}

function getTemplateModel(tenantDb) {
  return tenantDb.model('TaskTemplate', taskTemplateSchema);
}

function getAuditModel(tenantDb) {
  return tenantDb.model('AuditLog', auditLogSchema);
}

/**
 * List tasks with filters
 */
async function listTasks(tenantDb, options = {}) {
  const Task = getTaskModel(tenantDb);
  const filter = {};

  if (options.status) filter.status = options.status;
  if (options.zoneId) filter.zoneId = options.zoneId;
  if (options.assigneeId) filter.assigneeIds = options.assigneeId;
  if (options.type) filter.type = options.type;
  if (options.priority) filter.priority = options.priority;
  if (options.search) {
    filter.title = { $regex: options.search, $options: 'i' };
  }
  if (options.dateFrom || options.dateTo) {
    filter.scheduledDate = {};
    if (options.dateFrom) filter.scheduledDate.$gte = new Date(options.dateFrom);
    if (options.dateTo) filter.scheduledDate.$lte = new Date(options.dateTo);
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;
  const sort = options.sort || 'scheduledDate';
  const order = options.order === 'desc' ? -1 : 1;

  const [data, total] = await Promise.all([
    Task.find(filter).sort({ [sort]: order }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get tasks for calendar view (date range)
 */
async function getTasksCalendar(tenantDb, startDate, endDate) {
  const Task = getTaskModel(tenantDb);
  return Task.find({
    scheduledDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    status: { $ne: TASK_STATUSES.CANCELLED },
  })
    .sort({ scheduledDate: 1, scheduledTime: 1 })
    .lean();
}

/**
 * Get today's tasks for a team member
 */
async function getTodayTasks(tenantDb, userId) {
  const Task = getTaskModel(tenantDb);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Task.find({
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: { $in: [TASK_STATUSES.PENDING, TASK_STATUSES.IN_PROGRESS] },
    $or: [
      { assigneeIds: userId },
      { createdBy: userId },
    ],
  })
    .sort({ scheduledTime: 1, priority: -1 })
    .lean();
}

/**
 * Create task
 */
async function createTask(tenantDb, data, userId) {
  const Task = getTaskModel(tenantDb);
  const task = await Task.create({
    ...data,
    createdBy: userId,
  });

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'task.create',
    targetCollection: 'tasks',
    targetId: task._id,
    changes: { before: null, after: task.toJSON() },
  });

  return task.toJSON();
}

/**
 * Create task from template
 */
async function createTaskFromTemplate(tenantDb, templateId, overrides, userId) {
  const Template = getTemplateModel(tenantDb);
  const template = await Template.findById(templateId).lean();

  if (!template) {
    throw ApiError.notFound('Task template not found');
  }

  const taskData = {
    title: overrides.title || template.name,
    description: overrides.description || template.description,
    type: template.type,
    priority: overrides.priority || template.defaultPriority,
    scheduledDate: overrides.scheduledDate,
    scheduledTime: overrides.scheduledTime || null,
    estimatedDuration: template.estimatedDuration,
    zoneId: overrides.zoneId || null,
    assigneeIds: overrides.assigneeIds || [],
    equipmentIds: template.equipmentIds || [],
    inventoryUsed: template.inventoryNeeded || [],
    recurrence: overrides.recurrence || template.defaultRecurrence || { enabled: false },
  };

  return createTask(tenantDb, taskData, userId);
}

/**
 * Get task by ID
 */
async function getTaskById(tenantDb, taskId) {
  const Task = getTaskModel(tenantDb);
  const task = await Task.findById(taskId).lean();

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  return task;
}

/**
 * Update task
 */
async function updateTask(tenantDb, taskId, updates, userId) {
  const Task = getTaskModel(tenantDb);
  const task = await Task.findById(taskId);

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  const before = task.toJSON();
  Object.assign(task, updates);
  task._syncVersion += 1;
  await task.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'task.update',
    targetCollection: 'tasks',
    targetId: task._id,
    changes: { before, after: task.toJSON() },
  });

  return task.toJSON();
}

/**
 * Update task status
 */
async function updateTaskStatus(tenantDb, taskId, statusData, userId) {
  const Task = getTaskModel(tenantDb);
  const task = await Task.findById(taskId);

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  const before = task.toJSON();
  task.status = statusData.status;

  if (statusData.status === TASK_STATUSES.COMPLETED) {
    task.completedAt = new Date();
    task.completedBy = userId;
    if (statusData.actualDuration) {
      task.actualDuration = statusData.actualDuration;
    }
  }

  if (statusData.notes) {
    task.notes = statusData.notes;
  }

  task._syncVersion += 1;
  await task.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'task.status_update',
    targetCollection: 'tasks',
    targetId: task._id,
    changes: { before, after: task.toJSON() },
  });

  return task.toJSON();
}

/**
 * Cancel task (soft delete)
 */
async function cancelTask(tenantDb, taskId, userId) {
  return updateTaskStatus(tenantDb, taskId, { status: TASK_STATUSES.CANCELLED }, userId);
}

// ---- Task Templates ----

async function listTemplates(tenantDb) {
  const Template = getTemplateModel(tenantDb);
  return Template.find({}).sort({ name: 1 }).lean();
}

async function createTemplate(tenantDb, data) {
  const Template = getTemplateModel(tenantDb);
  const template = await Template.create(data);
  return template.toJSON();
}

async function updateTemplate(tenantDb, templateId, updates) {
  const Template = getTemplateModel(tenantDb);
  const template = await Template.findByIdAndUpdate(templateId, updates, { new: true, runValidators: true });
  if (!template) throw ApiError.notFound('Template not found');
  return template.toJSON();
}

async function deleteTemplate(tenantDb, templateId) {
  const Template = getTemplateModel(tenantDb);
  const template = await Template.findByIdAndDelete(templateId);
  if (!template) throw ApiError.notFound('Template not found');
}

module.exports = {
  listTasks,
  getTasksCalendar,
  getTodayTasks,
  createTask,
  createTaskFromTemplate,
  getTaskById,
  updateTask,
  updateTaskStatus,
  cancelTask,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
