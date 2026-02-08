/**
 * GreenKeep shared validation schemas (Joi)
 * Used by both server (request validation) and client (form validation)
 */

const Joi = require('joi');
const {
  ROLES,
  ZONE_TYPES,
  ZONE_HEALTH,
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  RECURRENCE_PATTERNS,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUSES,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  MOVEMENT_TYPES,
  SENSOR_TYPES,
  LANGUAGES,
} = require('./constants');

// ---- Helpers ----

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
const phonePattern = /^\+?[1-9]\d{1,14}$/;

// ---- Auth ----

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  role: Joi.string().valid(...Object.values(ROLES)).required(),
  tenantId: Joi.string().allow(null).optional(),
  lang: Joi.string().valid(...Object.values(LANGUAGES)).default('fr'),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  lang: Joi.string().valid(...Object.values(LANGUAGES)).optional(),
  avatar: Joi.string().uri().allow(null).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// ---- Tenant ----

const tenantSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).min(2).max(100).required(),
  address: Joi.object({
    street: Joi.string().max(300).allow('').optional(),
    city: Joi.string().max(100).allow('').optional(),
    zip: Joi.string().max(20).allow('').optional(),
    country: Joi.string().max(100).allow('').optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
  }).optional(),
  timezone: Joi.string().max(50).default('Europe/Paris'),
  logo: Joi.string().uri().allow(null).optional(),
  settings: Joi.object({
    defaultLang: Joi.string().valid(...Object.values(LANGUAGES)).default('fr'),
    mapCenter: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).optional(),
    mapZoom: Joi.number().min(1).max(22).default(15),
    weatherLocation: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).optional(),
    currency: Joi.string().max(3).default('EUR'),
  }).optional(),
});

// ---- Zone ----

const zoneSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  type: Joi.string().valid(...Object.values(ZONE_TYPES)).required(),
  holeNumber: Joi.number().integer().min(1).max(36).allow(null).optional(),
  area: Joi.number().positive().allow(null).optional(),
  geometry: Joi.object({
    type: Joi.string().valid('Polygon').required(),
    coordinates: Joi.array().items(
      Joi.array().items(
        Joi.array().ordered(
          Joi.number().min(-180).max(180),
          Joi.number().min(-90).max(90)
        ).length(2)
      ).min(4)
    ).length(1).required(),
  }).allow(null).optional(),
  health: Joi.string().valid(...Object.values(ZONE_HEALTH)).default('good'),
  grassType: Joi.string().max(100).allow(null, '').optional(),
  notes: Joi.string().max(2000).allow('').optional(),
});

const zoneHealthUpdateSchema = Joi.object({
  health: Joi.string().valid(...Object.values(ZONE_HEALTH)).required(),
  notes: Joi.string().max(2000).allow('').optional(),
});

// ---- Task ----

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  description: Joi.string().max(5000).allow('').optional(),
  type: Joi.string().valid(...Object.values(TASK_TYPES)).required(),
  priority: Joi.string().valid(...Object.values(TASK_PRIORITIES)).default('medium'),
  status: Joi.string().valid(...Object.values(TASK_STATUSES)).default('pending'),
  zoneId: objectId.allow(null).optional(),
  assigneeIds: Joi.array().items(objectId).default([]),
  scheduledDate: Joi.date().iso().required(),
  scheduledTime: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(null).optional(),
  estimatedDuration: Joi.number().integer().positive().allow(null).optional(),
  recurrence: Joi.object({
    enabled: Joi.boolean().default(false),
    pattern: Joi.string().valid(...Object.values(RECURRENCE_PATTERNS)).optional(),
    interval: Joi.number().integer().positive().allow(null).optional(),
    endDate: Joi.date().iso().allow(null).optional(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).allow(null).optional(),
  }).default({ enabled: false }),
  equipmentIds: Joi.array().items(objectId).default([]),
  inventoryUsed: Joi.array().items(
    Joi.object({
      itemId: objectId.required(),
      quantity: Joi.number().positive().required(),
    })
  ).default([]),
  weatherDependency: Joi.object({
    maxWind: Joi.number().positive().allow(null).optional(),
    noRain: Joi.boolean().default(false),
    minTemp: Joi.number().allow(null).optional(),
    maxTemp: Joi.number().allow(null).optional(),
  }).default({}),
  notes: Joi.string().max(5000).allow('').optional(),
});

const taskStatusUpdateSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TASK_STATUSES)).required(),
  actualDuration: Joi.number().integer().positive().allow(null).optional(),
  notes: Joi.string().max(5000).allow('').optional(),
});

// ---- Task Template ----

const taskTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  type: Joi.string().valid(...Object.values(TASK_TYPES)).required(),
  description: Joi.string().max(5000).allow('').optional(),
  estimatedDuration: Joi.number().integer().positive().allow(null).optional(),
  defaultPriority: Joi.string().valid(...Object.values(TASK_PRIORITIES)).default('medium'),
  defaultRecurrence: Joi.object({
    enabled: Joi.boolean().default(false),
    pattern: Joi.string().valid(...Object.values(RECURRENCE_PATTERNS)).optional(),
    interval: Joi.number().integer().positive().allow(null).optional(),
    daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).allow(null).optional(),
  }).optional(),
  equipmentIds: Joi.array().items(objectId).default([]),
  inventoryNeeded: Joi.array().items(
    Joi.object({
      itemId: objectId.required(),
      quantity: Joi.number().positive().required(),
    })
  ).default([]),
});

// ---- Team Member ----

const teamMemberSchema = Joi.object({
  userId: objectId.required(),
  position: Joi.string().max(200).allow('').optional(),
  phone: Joi.string().pattern(phonePattern).allow(null, '').optional(),
  skills: Joi.array().items(Joi.string().max(100)).default([]),
  certifications: Joi.array().items(
    Joi.object({
      name: Joi.string().max(200).required(),
      expiresAt: Joi.date().iso().allow(null).optional(),
    })
  ).default([]),
  availability: Joi.object({
    mon: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    tue: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    wed: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    thu: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    fri: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    sat: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
    sun: Joi.object({ start: Joi.string(), end: Joi.string() }).allow(null).optional(),
  }).optional(),
});

// ---- Time Entry ----

const timeEntrySchema = Joi.object({
  taskId: objectId.allow(null).optional(),
  zoneId: objectId.allow(null).optional(),
  clockIn: Joi.date().iso().required(),
  clockOut: Joi.date().iso().allow(null).optional(),
  breakMinutes: Joi.number().integer().min(0).default(0),
  notes: Joi.string().max(2000).allow('').optional(),
});

// ---- Equipment ----

const equipmentSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  category: Joi.string().valid(...Object.values(EQUIPMENT_CATEGORIES)).required(),
  brand: Joi.string().max(100).allow(null, '').optional(),
  model: Joi.string().max(100).allow(null, '').optional(),
  serialNumber: Joi.string().max(100).allow(null, '').optional(),
  purchaseDate: Joi.date().iso().allow(null).optional(),
  lastServiceDate: Joi.date().iso().allow(null).optional(),
  nextServiceDate: Joi.date().iso().allow(null).optional(),
  hoursUsed: Joi.number().min(0).default(0),
  status: Joi.string().valid(...Object.values(EQUIPMENT_STATUSES)).default('available'),
  location: Joi.string().max(200).allow(null, '').optional(),
  notes: Joi.string().max(2000).allow('').optional(),
});

// ---- Inventory ----

const inventoryItemSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  category: Joi.string().valid(...Object.values(INVENTORY_CATEGORIES)).required(),
  unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required(),
  currentStock: Joi.number().min(0).default(0),
  minStock: Joi.number().min(0).default(0),
  maxStock: Joi.number().positive().allow(null).optional(),
  location: Joi.string().max(200).allow(null, '').optional(),
  supplier: Joi.string().max(200).allow(null, '').optional(),
  unitCost: Joi.number().positive().allow(null).optional(),
  safetyDataSheet: Joi.string().uri().allow(null, '').optional(),
  expirationDate: Joi.date().iso().allow(null).optional(),
});

const inventoryMovementSchema = Joi.object({
  type: Joi.string().valid(...Object.values(MOVEMENT_TYPES)).required(),
  quantity: Joi.number().positive().required(),
  reason: Joi.string().max(500).required(),
  taskId: objectId.allow(null).optional(),
});

// ---- Sensor ----

const sensorReadingSchema = Joi.object({
  sensorId: Joi.string().max(100).required(),
  zoneId: objectId.allow(null).optional(),
  type: Joi.string().valid(...Object.values(SENSOR_TYPES)).required(),
  value: Joi.number().required(),
  unit: Joi.string().max(20).required(),
  readingAt: Joi.date().iso().required(),
});

const sensorReadingBatchSchema = Joi.object({
  readings: Joi.array().items(sensorReadingSchema).min(1).max(1000).required(),
});

// ---- Feature Flags ----

const featureFlagUpdateSchema = Joi.object({
  zones: Joi.boolean().optional(),
  tasks: Joi.boolean().optional(),
  team: Joi.boolean().optional(),
  equipment: Joi.boolean().optional(),
  inventory: Joi.boolean().optional(),
  weather: Joi.boolean().optional(),
  iot: Joi.boolean().optional(),
  calendar: Joi.boolean().optional(),
});

// ---- Pagination ----

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().max(50).optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().max(200).allow('').optional(),
});

module.exports = {
  objectId,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  tenantSchema,
  zoneSchema,
  zoneHealthUpdateSchema,
  taskSchema,
  taskStatusUpdateSchema,
  taskTemplateSchema,
  teamMemberSchema,
  timeEntrySchema,
  equipmentSchema,
  inventoryItemSchema,
  inventoryMovementSchema,
  sensorReadingSchema,
  sensorReadingBatchSchema,
  featureFlagUpdateSchema,
  paginationSchema,
};
