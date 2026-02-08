const teamMemberSchema = require('../models/TeamMember');
const timeEntrySchema = require('../models/TimeEntry');
const auditLogSchema = require('../models/AuditLog');
const ApiError = require('../utils/apiError');

function getMemberModel(tenantDb) {
  return tenantDb.model('TeamMember', teamMemberSchema);
}

function getTimeEntryModel(tenantDb) {
  return tenantDb.model('TimeEntry', timeEntrySchema);
}

function getAuditModel(tenantDb) {
  return tenantDb.model('AuditLog', auditLogSchema);
}

// ---- Team Members ----

async function listMembers(tenantDb, options = {}) {
  const Member = getMemberModel(tenantDb);
  const filter = { isActive: true };

  if (options.search) {
    filter.position = { $regex: options.search, $options: 'i' };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Member.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function createMember(tenantDb, data, userId) {
  const Member = getMemberModel(tenantDb);

  // Check if userId is already a team member
  const existing = await Member.findOne({ userId: data.userId, isActive: true });
  if (existing) {
    throw ApiError.conflict('This user is already a team member');
  }

  const member = await Member.create(data);

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'team.create',
    targetCollection: 'teamMembers',
    targetId: member._id,
    changes: { before: null, after: member.toJSON() },
  });

  return member.toJSON();
}

async function getMemberById(tenantDb, memberId) {
  const Member = getMemberModel(tenantDb);
  const member = await Member.findById(memberId).lean();

  if (!member || !member.isActive) {
    throw ApiError.notFound('Team member not found');
  }

  return member;
}

async function updateMember(tenantDb, memberId, updates, userId) {
  const Member = getMemberModel(tenantDb);
  const member = await Member.findById(memberId);

  if (!member || !member.isActive) {
    throw ApiError.notFound('Team member not found');
  }

  const before = member.toJSON();
  Object.assign(member, updates);
  member._syncVersion += 1;
  await member.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'team.update',
    targetCollection: 'teamMembers',
    targetId: member._id,
    changes: { before, after: member.toJSON() },
  });

  return member.toJSON();
}

async function deactivateMember(tenantDb, memberId, userId) {
  const Member = getMemberModel(tenantDb);
  const member = await Member.findById(memberId);

  if (!member) throw ApiError.notFound('Team member not found');

  member.isActive = false;
  member._syncVersion += 1;
  await member.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'team.deactivate',
    targetCollection: 'teamMembers',
    targetId: member._id,
    changes: { before: member.toJSON(), after: null },
  });
}

async function updateAvailability(tenantDb, memberId, availability, userId) {
  const Member = getMemberModel(tenantDb);
  const member = await Member.findById(memberId);

  if (!member || !member.isActive) throw ApiError.notFound('Team member not found');

  member.availability = availability;
  member._syncVersion += 1;
  await member.save();

  return member.toJSON();
}

// ---- Time Entries ----

async function getTimeEntries(tenantDb, memberId, options = {}) {
  const TimeEntry = getTimeEntryModel(tenantDb);
  const filter = { memberId };

  if (options.dateFrom || options.dateTo) {
    filter.clockIn = {};
    if (options.dateFrom) filter.clockIn.$gte = new Date(options.dateFrom);
    if (options.dateTo) filter.clockIn.$lte = new Date(options.dateTo);
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    TimeEntry.find(filter).sort({ clockIn: -1 }).skip(skip).limit(limit).lean(),
    TimeEntry.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function clockIn(tenantDb, memberId, data = {}) {
  const TimeEntry = getTimeEntryModel(tenantDb);

  // Check for open time entry
  const openEntry = await TimeEntry.findOne({ memberId, clockOut: null });
  if (openEntry) {
    throw ApiError.conflict('Already clocked in. Please clock out first.');
  }

  const entry = await TimeEntry.create({
    memberId,
    clockIn: new Date(),
    taskId: data.taskId || null,
    zoneId: data.zoneId || null,
    notes: data.notes || '',
  });

  return entry.toJSON();
}

async function clockOut(tenantDb, memberId, data = {}) {
  const TimeEntry = getTimeEntryModel(tenantDb);
  const entry = await TimeEntry.findOne({ memberId, clockOut: null });

  if (!entry) {
    throw ApiError.notFound('No open time entry found. Please clock in first.');
  }

  entry.clockOut = new Date();
  entry.breakMinutes = data.breakMinutes || 0;
  if (data.notes) entry.notes = data.notes;
  entry._syncVersion += 1;
  await entry.save();

  return entry.toJSON();
}

module.exports = {
  listMembers,
  createMember,
  getMemberById,
  updateMember,
  deactivateMember,
  updateAvailability,
  getTimeEntries,
  clockIn,
  clockOut,
};
