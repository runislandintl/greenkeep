const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { connectGlobal } = require('./config/database');
const { passport } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import models (register on global connection)
require('./models/User');
require('./models/Tenant');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tenantRoutes = require('./routes/tenant.routes');
const zoneRoutes = require('./routes/zone.routes');
const taskRoutes = require('./routes/task.routes');
const teamRoutes = require('./routes/team.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const weatherRoutes = require('./routes/weather.routes');
const sensorRoutes = require('./routes/sensor.routes');
const calendarRoutes = require('./routes/calendar.routes');
const syncRoutes = require('./routes/sync.routes');
const featureFlagRoutes = require('./routes/featureFlag.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.cors.origin,
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'greenkeep', timestamp: new Date().toISOString() });
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

// Start server
async function start() {
  try {
    await connectGlobal();
    app.listen(env.port, () => {
      logger.info(`GreenKeep server running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Export for testing
module.exports = app;

// Start if run directly
if (require.main === module) {
  start();
}
