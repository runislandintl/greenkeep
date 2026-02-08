const sensorReadingSchema = require('../models/SensorReading');
const ApiError = require('../utils/apiError');

function getSensorModel(tenantDb) {
  return tenantDb.model('SensorReading', sensorReadingSchema);
}

/**
 * Ingest a batch of sensor readings
 */
async function ingestReadings(tenantDb, readings) {
  const SensorReading = getSensorModel(tenantDb);
  const result = await SensorReading.insertMany(readings);
  return { inserted: result.length };
}

/**
 * Get readings for a specific sensor
 */
async function getSensorReadings(tenantDb, sensorId, options = {}) {
  const SensorReading = getSensorModel(tenantDb);
  const filter = { sensorId };

  if (options.type) filter.type = options.type;
  if (options.from || options.to) {
    filter.readingAt = {};
    if (options.from) filter.readingAt.$gte = new Date(options.from);
    if (options.to) filter.readingAt.$lte = new Date(options.to);
  }

  const limit = options.limit || 100;

  return SensorReading.find(filter)
    .sort({ readingAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get readings for a zone
 */
async function getZoneReadings(tenantDb, zoneId, options = {}) {
  const SensorReading = getSensorModel(tenantDb);
  const filter = { zoneId };

  if (options.type) filter.type = options.type;
  if (options.from || options.to) {
    filter.readingAt = {};
    if (options.from) filter.readingAt.$gte = new Date(options.from);
    if (options.to) filter.readingAt.$lte = new Date(options.to);
  }

  const limit = options.limit || 200;

  return SensorReading.find(filter)
    .sort({ readingAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get latest reading per sensor for a zone
 */
async function getLatestZoneReadings(tenantDb, zoneId) {
  const SensorReading = getSensorModel(tenantDb);

  return SensorReading.aggregate([
    { $match: { zoneId: zoneId } },
    { $sort: { readingAt: -1 } },
    {
      $group: {
        _id: { sensorId: '$sensorId', type: '$type' },
        value: { $first: '$value' },
        unit: { $first: '$unit' },
        readingAt: { $first: '$readingAt' },
        sensorId: { $first: '$sensorId' },
        type: { $first: '$type' },
      },
    },
  ]);
}

module.exports = {
  ingestReadings,
  getSensorReadings,
  getZoneReadings,
  getLatestZoneReadings,
};
