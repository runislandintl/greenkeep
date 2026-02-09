const { FEATURE_FLAG_DEFAULTS } = require('../../../shared/featureFlagDefaults');

/**
 * Resolve feature flags for a tenant
 * Merges defaults with tenant-specific overrides
 * @param {Object|null} tenantFlags - Tenant-specific flag overrides
 * @returns {Object} Resolved feature flags
 */
function resolveFlags(tenantFlags = {}) {
  return {
    ...FEATURE_FLAG_DEFAULTS,
    ...(tenantFlags || {}),
  };
}

/**
 * Check if a specific feature is enabled for a tenant
 * @param {Object|null} tenantFlags - Tenant-specific flag overrides
 * @param {string} featureName - Feature to check
 * @returns {boolean}
 */
function isFeatureEnabled(tenantFlags, featureName) {
  const flags = resolveFlags(tenantFlags);
  return flags[featureName] === true;
}

module.exports = {
  resolveFlags,
  isFeatureEnabled,
};
