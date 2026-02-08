const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

// Cache for tenant database connections
const tenantConnections = new Map();

/**
 * Connect to the global MongoDB database
 */
async function connectGlobal() {
  try {
    // Build connection URI: handle Atlas URIs that may contain query params
    let uri = env.mongodb.uri;
    const dbName = env.mongodb.globalDb;

    // If URI has query string (?retryWrites=true&...), insert dbName before it
    // If URI ends with /, append dbName
    // Otherwise, append /dbName
    if (uri.includes('?')) {
      const [base, query] = uri.split('?');
      const cleanBase = base.endsWith('/') ? base : base + '/';
      uri = `${cleanBase}${dbName}?${query}`;
    } else {
      const cleanBase = uri.endsWith('/') ? uri : uri + '/';
      uri = `${cleanBase}${dbName}`;
    }

    await mongoose.connect(uri);
    logger.info(`Connected to global database: ${dbName}`);
  } catch (error) {
    logger.error('Failed to connect to global database', { error: error.message });
    throw error;
  }
}

/**
 * Get or create a connection to a tenant-specific database
 * @param {string} tenantSlug - The tenant slug (e.g., "golf-de-lyon")
 * @returns {mongoose.Connection} Mongoose connection for the tenant database
 */
function getTenantDb(tenantSlug) {
  const dbName = `greenkeep_t_${tenantSlug.replace(/-/g, '_')}`;

  if (tenantConnections.has(dbName)) {
    return tenantConnections.get(dbName);
  }

  const connection = mongoose.connection.useDb(dbName, { useCache: true });
  tenantConnections.set(dbName, connection);
  logger.info(`Created tenant database connection: ${dbName}`);
  return connection;
}

/**
 * Get a model bound to a specific tenant's database
 * @param {string} tenantSlug - The tenant slug
 * @param {string} modelName - The model name (e.g., "Zone")
 * @param {mongoose.Schema} schema - The mongoose schema
 * @returns {mongoose.Model} Model bound to tenant database
 */
function getTenantModel(tenantSlug, modelName, schema) {
  const db = getTenantDb(tenantSlug);
  return db.model(modelName, schema);
}

/**
 * Close all connections
 */
async function closeAll() {
  tenantConnections.clear();
  await mongoose.disconnect();
  logger.info('All database connections closed');
}

module.exports = {
  connectGlobal,
  getTenantDb,
  getTenantModel,
  closeAll,
};
