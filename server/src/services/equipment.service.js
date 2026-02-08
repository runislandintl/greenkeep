const equipmentSchema = require('../models/Equipment');
const auditLogSchema = require('../models/AuditLog');
const ApiError = require('../utils/apiError');

function getEquipmentModel(tenantDb) {
  return tenantDb.model('Equipment', equipmentSchema);
}

function getAuditModel(tenantDb) {
  return tenantDb.model('AuditLog', auditLogSchema);
}

async function listEquipment(tenantDb, options = {}) {
  const Equipment = getEquipmentModel(tenantDb);
  const filter = { isActive: true };

  if (options.category) filter.category = options.category;
  if (options.status) filter.status = options.status;
  if (options.search) {
    filter.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { brand: { $regex: options.search, $options: 'i' } },
    ];
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Equipment.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Equipment.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function createEquipment(tenantDb, data, userId) {
  const Equipment = getEquipmentModel(tenantDb);
  const equipment = await Equipment.create(data);

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'equipment.create',
    targetCollection: 'equipment',
    targetId: equipment._id,
    changes: { before: null, after: equipment.toJSON() },
  });

  return equipment.toJSON();
}

async function getEquipmentById(tenantDb, equipmentId) {
  const Equipment = getEquipmentModel(tenantDb);
  const equipment = await Equipment.findById(equipmentId).lean();

  if (!equipment || !equipment.isActive) {
    throw ApiError.notFound('Equipment not found');
  }

  return equipment;
}

async function updateEquipment(tenantDb, equipmentId, updates, userId) {
  const Equipment = getEquipmentModel(tenantDb);
  const equipment = await Equipment.findById(equipmentId);

  if (!equipment || !equipment.isActive) {
    throw ApiError.notFound('Equipment not found');
  }

  const before = equipment.toJSON();
  Object.assign(equipment, updates);
  equipment._syncVersion += 1;
  await equipment.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'equipment.update',
    targetCollection: 'equipment',
    targetId: equipment._id,
    changes: { before, after: equipment.toJSON() },
  });

  return equipment.toJSON();
}

async function updateEquipmentStatus(tenantDb, equipmentId, status, userId) {
  const Equipment = getEquipmentModel(tenantDb);
  const equipment = await Equipment.findById(equipmentId);

  if (!equipment || !equipment.isActive) {
    throw ApiError.notFound('Equipment not found');
  }

  const before = equipment.toJSON();
  equipment.status = status;
  equipment._syncVersion += 1;
  await equipment.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'equipment.status_update',
    targetCollection: 'equipment',
    targetId: equipment._id,
    changes: { before, after: equipment.toJSON() },
  });

  return equipment.toJSON();
}

async function deleteEquipment(tenantDb, equipmentId, userId) {
  const Equipment = getEquipmentModel(tenantDb);
  const equipment = await Equipment.findById(equipmentId);

  if (!equipment) throw ApiError.notFound('Equipment not found');

  equipment.isActive = false;
  equipment._syncVersion += 1;
  await equipment.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'equipment.delete',
    targetCollection: 'equipment',
    targetId: equipment._id,
    changes: { before: equipment.toJSON(), after: null },
  });
}

module.exports = {
  listEquipment,
  createEquipment,
  getEquipmentById,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment,
};
