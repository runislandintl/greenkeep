const mongoose = require('mongoose');
const { resolveFlags } = require('../config/featureFlags');
const ApiError = require('../utils/apiError');

function getTenant() {
  return mongoose.model('Tenant');
}

/**
 * Get resolved feature flags for a tenant
 */
async function getFlags(tenantId) {
  const Tenant = getTenant();
  const tenant = await Tenant.findById(tenantId).lean();

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  return resolveFlags(tenant.featureFlags);
}

/**
 * Update feature flags for a tenant
 */
async function updateFlags(tenantId, flagUpdates) {
  const Tenant = getTenant();
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  // Merge updates
  for (const [key, value] of Object.entries(flagUpdates)) {
    if (tenant.featureFlags[key] !== undefined) {
      tenant.featureFlags[key] = value;
    }
  }

  tenant.markModified('featureFlags');
  await tenant.save();

  return resolveFlags(tenant.featureFlags);
}

module.exports = {
  getFlags,
  updateFlags,
};
