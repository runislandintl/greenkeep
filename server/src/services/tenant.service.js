const mongoose = require('mongoose');
const { getTenantDb } = require('../config/database');
const { FEATURE_FLAG_DEFAULTS } = require('@greenkeep/shared/featureFlags');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

function getTenant() {
  return mongoose.model('Tenant');
}

function getUser() {
  return mongoose.model('User');
}

/**
 * List all tenants
 */
async function listTenants(options = {}) {
  const Tenant = getTenant();
  const filter = {};

  if (options.search) {
    filter.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { slug: { $regex: options.search, $options: 'i' } },
    ];
  }

  if (options.isActive !== undefined) {
    filter.isActive = options.isActive;
  }

  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Tenant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Tenant.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Create a new tenant and provision its database
 */
async function createTenant(tenantData) {
  const Tenant = getTenant();

  const existing = await Tenant.findOne({ slug: tenantData.slug });
  if (existing) {
    throw ApiError.conflict(`Tenant with slug "${tenantData.slug}" already exists`);
  }

  const tenant = await Tenant.create({
    ...tenantData,
    featureFlags: {
      ...FEATURE_FLAG_DEFAULTS,
      ...(tenantData.featureFlags || {}),
    },
  });

  // Provision tenant database (creates it on first access)
  const tenantDb = getTenantDb(tenant.slug);
  logger.info(`Provisioned tenant database for: ${tenant.slug}`);

  return tenant.toJSON();
}

/**
 * Get tenant by ID
 */
async function getTenantById(tenantId) {
  const Tenant = getTenant();
  const tenant = await Tenant.findById(tenantId).lean();

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  return tenant;
}

/**
 * Update tenant
 */
async function updateTenant(tenantId, updates) {
  const Tenant = getTenant();
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  // Prevent slug change (would break DB reference)
  delete updates.slug;

  Object.assign(tenant, updates);
  await tenant.save();

  return tenant.toJSON();
}

/**
 * Deactivate tenant (soft delete)
 */
async function deactivateTenant(tenantId) {
  const Tenant = getTenant();
  const tenant = await Tenant.findById(tenantId);

  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  tenant.isActive = false;
  await tenant.save();

  return tenant.toJSON();
}

/**
 * List users for a tenant
 */
async function listTenantUsers(tenantId, options = {}) {
  const User = getUser();
  const filter = { tenantId };

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  // Remove password hashes from response
  const safeData = data.map((u) => {
    const { passwordHash, ...rest } = u;
    return rest;
  });

  return {
    data: safeData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  listTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deactivateTenant,
  listTenantUsers,
};
