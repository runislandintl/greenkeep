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
    await mongoose.connect(`${env.mongodb.uri}/${env.mongodb.globalDb}`);
    logger.info(`Connected to global database: ${env.mongodb.globalDb}`);
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
