const zoneSchema = require('../models/Zone');
const taskSchema = require('../models/Task');
const teamMemberSchema = require('../models/TeamMember');
const equipmentSchema = require('../models/Equipment');
const inventoryItemSchema = require('../models/InventoryItem');

/**
 * Collections that support offline sync
 */
const SYNCABLE_COLLECTIONS = {
  zones: zoneSchema,
  tasks: taskSchema,
  teamMembers: teamMemberSchema,
  equipment: equipmentSchema,
  inventoryItems: inventoryItemSchema,
};

/**
 * Pull changes since a given sync version
 * Client sends: { lastSyncVersions: { zones: 5, tasks: 10, ... } }
 * Server returns: all records with _syncVersion > clientVersion
 */
async function pullChanges(tenantDb, lastSyncVersions = {}) {
  const changes = {};

  for (const [collectionName, schema] of Object.entries(SYNCABLE_COLLECTIONS)) {
    const Model = tenantDb.model(
      collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
      schema
    );

    const clientVersion = lastSyncVersions[collectionName] || 0;

    const records = await Model.find({
      _syncVersion: { $gt: clientVersion },
    }).lean();

    if (records.length > 0) {
      changes[collectionName] = records;
    }
  }

  return changes;
}

/**
 * Push offline changes from client
 * Uses last-write-wins strategy based on _syncVersion
 *
 * Client sends: { changes: { zones: [...], tasks: [...] } }
 * Each record has: _id, _syncVersion, ...data
 */
async function pushChanges(tenantDb, clientChanges = {}, userId) {
  const results = {
    accepted: {},
    rejected: {},
  };

  for (const [collectionName, records] of Object.entries(clientChanges)) {
    const schema = SYNCABLE_COLLECTIONS[collectionName];
    if (!schema) continue;

    const Model = tenantDb.model(
      collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
      schema
    );

    results.accepted[collectionName] = [];
    results.rejected[collectionName] = [];

    for (const record of records) {
      try {
        if (!record._id) {
          // New record (created offline)
          const created = await Model.create({
            ...record,
            _syncVersion: 1,
          });
          results.accepted[collectionName].push({
            tempId: record._tempId,
            _id: created._id,
            _syncVersion: created._syncVersion,
          });
        } else {
          // Existing record - last-write-wins
          const existing = await Model.findById(record._id);

          if (!existing) {
            results.rejected[collectionName].push({
              _id: record._id,
              reason: 'not_found',
            });
            continue;
          }

          // If server version is newer, reject client change
          if (existing._syncVersion > record._syncVersion) {
            results.rejected[collectionName].push({
              _id: record._id,
              reason: 'conflict',
              serverVersion: existing._syncVersion,
              serverData: existing.toJSON(),
            });
            continue;
          }

          // Apply client changes
          const { _id, _syncVersion, _tempId, createdAt, updatedAt, ...updates } = record;
          Object.assign(existing, updates);
          existing._syncVersion = (existing._syncVersion || 0) + 1;
          await existing.save();

          results.accepted[collectionName].push({
            _id: existing._id,
            _syncVersion: existing._syncVersion,
          });
        }
      } catch (error) {
        results.rejected[collectionName].push({
          _id: record._id || record._tempId,
          reason: 'error',
          message: error.message,
        });
      }
    }
  }

  return results;
}

module.exports = {
  pullChanges,
  pushChanges,
  SYNCABLE_COLLECTIONS,
};
