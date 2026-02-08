/**
 * Seed script - Creates initial superadmin and demo tenant
 * Run: node src/seed.js
 */
const mongoose = require('mongoose');
const env = require('./config/env');
const { connectGlobal } = require('./config/database');
const authService = require('./services/auth.service');
const tenantService = require('./services/tenant.service');
const logger = require('./utils/logger');

// Register models
require('./models/User');
require('./models/Tenant');

async function seed() {
  try {
    await connectGlobal();
    logger.info('Connected to database. Starting seed...');

    // 1. Create superadmin user
    let superadmin;
    try {
      superadmin = await authService.register({
        email: 'admin@greenkeep.app',
        password: 'GreenKeep2026!',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        lang: 'fr',
      });
      logger.info(`Created superadmin: ${superadmin.email}`);
    } catch (error) {
      if (error.message.includes('already registered')) {
        logger.info('Superadmin already exists, skipping...');
        const User = mongoose.model('User');
        superadmin = await User.findOne({ email: 'admin@greenkeep.app' }).lean();
      } else {
        throw error;
      }
    }

    // 2. Create demo tenant
    let tenant;
    try {
      tenant = await tenantService.createTenant({
        name: 'Golf de la Demo',
        slug: 'golf-demo',
        timezone: 'Europe/Paris',
        address: {
          street: '1 Avenue du Golf',
          city: 'Paris',
          zip: '75001',
          country: 'France',
          lat: 48.8566,
          lng: 2.3522,
        },
        settings: {
          defaultLang: 'fr',
          mapCenter: { lat: 48.8566, lng: 2.3522 },
          mapZoom: 16,
          weatherLocation: { lat: 48.8566, lng: 2.3522 },
          currency: 'EUR',
        },
      });
      logger.info(`Created demo tenant: ${tenant.name} (${tenant.slug})`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        logger.info('Demo tenant already exists, skipping...');
        const Tenant = mongoose.model('Tenant');
        tenant = await Tenant.findOne({ slug: 'golf-demo' }).lean();
      } else {
        throw error;
      }
    }

    // 3. Create admin user for demo tenant
    try {
      const admin = await authService.register({
        email: 'admin@golf-demo.greenkeep.app',
        password: 'GolfDemo2026!',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'admin',
        tenantId: tenant._id,
        lang: 'fr',
      });
      logger.info(`Created tenant admin: ${admin.email}`);
    } catch (error) {
      if (error.message.includes('already registered')) {
        logger.info('Tenant admin already exists, skipping...');
      } else {
        throw error;
      }
    }

    // 4. Create team member user for demo tenant
    try {
      const teamUser = await authService.register({
        email: 'team@golf-demo.greenkeep.app',
        password: 'TeamDemo2026!',
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'team',
        tenantId: tenant._id,
        lang: 'fr',
      });
      logger.info(`Created team user: ${teamUser.email}`);
    } catch (error) {
      if (error.message.includes('already registered')) {
        logger.info('Team user already exists, skipping...');
      } else {
        throw error;
      }
    }

    logger.info('');
    logger.info('=== Seed completed successfully! ===');
    logger.info('');
    logger.info('Login credentials:');
    logger.info('  Superadmin: admin@greenkeep.app / GreenKeep2026!');
    logger.info('  Admin:      admin@golf-demo.greenkeep.app / GolfDemo2026!');
    logger.info('  Team:       team@golf-demo.greenkeep.app / TeamDemo2026!');
    logger.info('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed', { error: error.message });
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
