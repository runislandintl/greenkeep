const mongoose = require('mongoose');
const { getTenantDb } = require('../config/database');
const ApiError = require('../utils/apiError');
const { ROLES } = require('@greenkeep/shared/constants');

let Tenant;

function getTenantModel() {
  if (!Tenant) {
    Tenant = mongoose.model('Tenant');
  }
  return Tenant;
}

/**
 * Middleware to resolve tenant from JWT user's tenantId
 * Sets req.tenant and req.tenantDb on the request
 */
async function tenantResolver(req, res, next) {
  try {
    // Superadmin can access any tenant via ?tenantId= query param or header
    const tenantId =
      req.user.role === ROLES.SUPERADMIN
        ? req.query.tenantId || req.headers['x-tenant-id'] || req.user.tenantId
        : req.user.tenantId;

    if (!tenantId) {
      // Superadmin without tenant context - some routes allow this
      req.tenant = null;
      req.tenantDb = null;
      return next();
    }

    const TenantModel = getTenantModel();
    const tenant = await TenantModel.findById(tenantId).lean();

    if (!tenant) {
      return next(ApiError.notFound('Tenant not found'));
    }

    if (!tenant.isActive) {
      return next(ApiError.forbidden('Tenant is suspended'));
    }

    req.tenant = tenant;
    req.tenantDb = getTenantDb(tenant.slug);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require tenant context (for routes that need a tenant)
 */
function requireTenant(req, res, next) {
  if (!req.tenant) {
    return next(ApiError.badRequest('Tenant context required. Provide tenantId query param or header.'));
  }
  next();
}

module.exports = {
  tenantResolver,
  requireTenant,
};
