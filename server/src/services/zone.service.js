const zoneSchema = require('../models/Zone');
const auditLogSchema = require('../models/AuditLog');
const ApiError = require('../utils/apiError');

/**
 * Get Zone model for a tenant
 */
function getZoneModel(tenantDb) {
  return tenantDb.model('Zone', zoneSchema);
}

function getAuditModel(tenantDb) {
  return tenantDb.model('AuditLog', auditLogSchema);
}

/**
 * List zones with filters
 */
async function listZones(tenantDb, options = {}) {
  const Zone = getZoneModel(tenantDb);
  const filter = { isActive: true };

  if (options.type) filter.type = options.type;
  if (options.health) filter.health = options.health;
  if (options.holeNumber) filter.holeNumber = options.holeNumber;
  if (options.search) {
    filter.name = { $regex: options.search, $options: 'i' };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;
  const sort = options.sort || 'name';
  const order = options.order === 'desc' ? -1 : 1;

  const [data, total] = await Promise.all([
    Zone.find(filter).sort({ [sort]: order }).skip(skip).limit(limit).lean(),
    Zone.countDocuments(filter),
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
 * Get all zones as GeoJSON FeatureCollection for map display
 */
async function getZonesGeoJSON(tenantDb) {
  const Zone = getZoneModel(tenantDb);
  const zones = await Zone.find({ isActive: true, 'geometry.coordinates': { $exists: true } }).lean();

  return {
    type: 'FeatureCollection',
    features: zones.map((zone) => ({
      type: 'Feature',
      id: zone._id.toString(),
      geometry: zone.geometry,
      properties: {
        id: zone._id,
        name: zone.name,
        type: zone.type,
        holeNumber: zone.holeNumber,
        health: zone.health,
        area: zone.area,
        grassType: zone.grassType,
        lastMaintenanceAt: zone.lastMaintenanceAt,
      },
    })),
  };
}

/**
 * Create zone
 */
async function createZone(tenantDb, data, userId) {
  const Zone = getZoneModel(tenantDb);
  const zone = await Zone.create(data);

  // Audit log
  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'zone.create',
    targetCollection: 'zones',
    targetId: zone._id,
    changes: { before: null, after: zone.toJSON() },
  });

  return zone.toJSON();
}

/**
 * Get zone by ID
 */
async function getZoneById(tenantDb, zoneId) {
  const Zone = getZoneModel(tenantDb);
  const zone = await Zone.findById(zoneId).lean();

  if (!zone || !zone.isActive) {
    throw ApiError.notFound('Zone not found');
  }

  return zone;
}

/**
 * Update zone
 */
async function updateZone(tenantDb, zoneId, updates, userId) {
  const Zone = getZoneModel(tenantDb);
  const zone = await Zone.findById(zoneId);

  if (!zone || !zone.isActive) {
    throw ApiError.notFound('Zone not found');
  }

  const before = zone.toJSON();
  Object.assign(zone, updates);
  zone._syncVersion += 1;
  await zone.save();

  // Audit log
  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'zone.update',
    targetCollection: 'zones',
    targetId: zone._id,
    changes: { before, after: zone.toJSON() },
  });

  return zone.toJSON();
}

/**
 * Update zone health status
 */
async function updateZoneHealth(tenantDb, zoneId, healthData, userId) {
  const Zone = getZoneModel(tenantDb);
  const zone = await Zone.findById(zoneId);

  if (!zone || !zone.isActive) {
    throw ApiError.notFound('Zone not found');
  }

  const before = zone.toJSON();
  zone.health = healthData.health;
  if (healthData.notes) zone.notes = healthData.notes;
  zone._syncVersion += 1;
  await zone.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'zone.health_update',
    targetCollection: 'zones',
    targetId: zone._id,
    changes: { before, after: zone.toJSON() },
  });

  return zone.toJSON();
}

/**
 * Soft delete zone
 */
async function deleteZone(tenantDb, zoneId, userId) {
  const Zone = getZoneModel(tenantDb);
  const zone = await Zone.findById(zoneId);

  if (!zone) {
    throw ApiError.notFound('Zone not found');
  }

  zone.isActive = false;
  zone._syncVersion += 1;
  await zone.save();

  const AuditLog = getAuditModel(tenantDb);
  await AuditLog.create({
    userId,
    action: 'zone.delete',
    targetCollection: 'zones',
    targetId: zone._id,
    changes: { before: zone.toJSON(), after: null },
  });
}

module.exports = {
  listZones,
  getZonesGeoJSON,
  createZone,
  getZoneById,
  updateZone,
  updateZoneHealth,
  deleteZone,
};
