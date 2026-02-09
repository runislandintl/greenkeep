let app;
let initError = null;

try {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const mongoose = require('mongoose');
  const { passport } = require('../server/src/middleware/auth');
  const errorHandler = require('../server/src/middleware/errorHandler');
  const { apiLimiter } = require('../server/src/middleware/rateLimiter');
  const env = require('../server/src/config/env');

  // Import models (register on global connection)
  require('../server/src/models/User');
  require('../server/src/models/Tenant');

  // Import routes
  const authRoutes = require('../server/src/routes/auth.routes');
  const tenantRoutes = require('../server/src/routes/tenant.routes');
  const zoneRoutes = require('../server/src/routes/zone.routes');
  const taskRoutes = require('../server/src/routes/task.routes');
  const teamRoutes = require('../server/src/routes/team.routes');
  const equipmentRoutes = require('../server/src/routes/equipment.routes');
  const inventoryRoutes = require('../server/src/routes/inventory.routes');
  const weatherRoutes = require('../server/src/routes/weather.routes');
  const sensorRoutes = require('../server/src/routes/sensor.routes');
  const calendarRoutes = require('../server/src/routes/calendar.routes');
  const syncRoutes = require('../server/src/routes/sync.routes');
  const featureFlagRoutes = require('../server/src/routes/featureFlag.routes');

  app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: env.cors.origin || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-API-Key', 'X-Tenant-Slug'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Passport
  app.use(passport.initialize());

  // Rate limiting
  app.use('/api/', apiLimiter);

  // Health check (BEFORE MongoDB middleware — no DB needed)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'greenkeep',
      timestamp: new Date().toISOString(),
      dbState: mongoose.connection.readyState,
    });
  });

  // Lazy MongoDB connection for serverless
  let isConnected = false;
  app.use(async (req, res, next) => {
    if (!isConnected && mongoose.connection.readyState !== 1) {
      try {
        let uri = env.mongodb.uri;
        const dbName = env.mongodb.globalDb;
        if (uri.includes('?')) {
          const [base, query] = uri.split('?');
          const cleanBase = base.endsWith('/') ? base : base + '/';
          uri = `${cleanBase}${dbName}?${query}`;
        } else {
          const cleanBase = uri.endsWith('/') ? uri : uri + '/';
          uri = `${cleanBase}${dbName}`;
        }
        await mongoose.connect(uri);
        isConnected = true;
        console.log('Connected to MongoDB Atlas');
      } catch (error) {
        console.error('MongoDB connection error:', error.message);
        const uriHint = env.mongodb.uri
          ? env.mongodb.uri.replace(/\/\/[^@]+@/, '//***@').substring(0, 60) + '...'
          : 'NOT SET';
        return res.status(500).json({
          error: 'Database connection failed',
          detail: error.message,
          uriHint,
          dbName,
        });
      }
    }
    next();
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/tenants', tenantRoutes);
  app.use('/api/v1/zones', zoneRoutes);
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api/v1/team', teamRoutes);
  app.use('/api/v1/equipment', equipmentRoutes);
  app.use('/api/v1/inventory', inventoryRoutes);
  app.use('/api/v1/weather', weatherRoutes);
  app.use('/api/v1/sensors', sensorRoutes);
  app.use('/api/v1/calendar', calendarRoutes);
  app.use('/api/v1/sync', syncRoutes);
  app.use('/api/v1/feature-flags', featureFlagRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Global error handler
  app.use(errorHandler);

} catch (error) {
  initError = error;
  console.error('INIT ERROR:', error.message, error.stack);
}

// Export handler function for Vercel
module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
      stack: process.env.NODE_ENV !== 'production' ? initError.stack : undefined,
    });
  }
  return app(req, res);
};
