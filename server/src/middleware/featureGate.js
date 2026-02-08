const { resolveFlags } = require('../config/featureFlags');
const ApiError = require('../utils/apiError');

/**
 * Middleware to gate routes behind feature flags
 * @param {string} featureName - Feature flag name to check
 * @returns {Function} Express middleware
 */
function featureGate(featureName) {
  return (req, res, next) => {
    if (!req.tenant) {
      // No tenant context = superadmin routes, always allow
      return next();
    }

    const flags = resolveFlags(req.tenant.featureFlags);

    if (!flags[featureName]) {
      return next(
        ApiError.forbidden(
          `Feature "${featureName}" is not enabled for this tenant`
        )
      );
    }

    next();
  };
}

module.exports = featureGate;
