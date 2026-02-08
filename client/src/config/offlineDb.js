import Dexie from 'dexie';

const db = new Dexie('greenkeep_offline');

db.version(1).stores({
  zones: '_id, type, holeNumber, health, _syncVersion',
  tasks: '_id, status, scheduledDate, zoneId, _syncVersion',
  teamMembers: '_id, userId, isActive, _syncVersion',
  equipment: '_id, category, status, _syncVersion',
  inventoryItems: '_id, category, currentStock, _syncVersion',
  pendingSync: '++id, collection, action, createdAt',
  syncMeta: 'collection',
});

export default db;

/**
 * Save records to offline DB
 */
export async function saveToOffline(collection, records) {
  const table = db.table(collection);
  await table.bulkPut(records);
}

/**
 * Get all records from offline DB
 */
export async function getFromOffline(collection) {
  const table = db.table(collection);
  return table.toArray();
}

/**
 * Queue a change for sync
 */
export async function queueSync(collection, action, data) {
  await db.pendingSync.add({
    collection,
    action, // 'create', 'update', 'delete'
    data,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get pending sync items
 */
export async function getPendingSync() {
  return db.pendingSync.toArray();
}

/**
 * Clear pending sync items after successful sync
 */
export async function clearPendingSync(ids) {
  await db.pendingSync.bulkDelete(ids);
}

/**
 * Save sync metadata (last sync version per collection)
 */
export async function saveSyncMeta(collection, version) {
  await db.syncMeta.put({ collection, lastSyncVersion: version });
}

/**
 * Get sync metadata
 */
export async function getSyncMeta() {
  const entries = await db.syncMeta.toArray();
  const meta = {};
  for (const entry of entries) {
    meta[entry.collection] = entry.lastSyncVersion;
  }
  return meta;
}
