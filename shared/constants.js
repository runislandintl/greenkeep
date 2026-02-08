/**
 * GreenKeep shared constants
 * Used by both server and client
 */

const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  TEAM: 'team',
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPERADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.TEAM]: 1,
});

const ZONE_TYPES = Object.freeze({
  GREEN: 'green',
  FAIRWAY: 'fairway',
  ROUGH: 'rough',
  BUNKER: 'bunker',
  TEEBOX: 'teebox',
  WATER: 'water',
  PATH: 'path',
  BUILDING: 'building',
  OTHER: 'other',
});

const ZONE_HEALTH = Object.freeze({
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  CRITICAL: 'critical',
});

const TASK_TYPES = Object.freeze({
  MOWING: 'mowing',
  WATERING: 'watering',
  FERTILIZING: 'fertilizing',
  AERATION: 'aeration',
  TOPDRESSING: 'topdressing',
  PEST_TREATMENT: 'pest_treatment',
  SEEDING: 'seeding',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  OTHER: 'other',
});

const TASK_PRIORITIES = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

const TASK_STATUSES = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred',
});

const RECURRENCE_PATTERNS = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
});

const EQUIPMENT_CATEGORIES = Object.freeze({
  MOWER: 'mower',
  TRACTOR: 'tractor',
  SPRAYER: 'sprayer',
  AERATOR: 'aerator',
  ROLLER: 'roller',
  UTILITY_VEHICLE: 'utility_vehicle',
  HAND_TOOL: 'hand_tool',
  IRRIGATION: 'irrigation',
  OTHER: 'other',
});

const EQUIPMENT_STATUSES = Object.freeze({
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  BROKEN: 'broken',
  RETIRED: 'retired',
});

const INVENTORY_CATEGORIES = Object.freeze({
  SEED: 'seed',
  FERTILIZER: 'fertilizer',
  PESTICIDE: 'pesticide',
  FUNGICIDE: 'fungicide',
  HERBICIDE: 'herbicide',
  FUEL: 'fuel',
  SPARE_PART: 'spare_part',
  SAND: 'sand',
  SOIL: 'soil',
  OTHER: 'other',
});

const INVENTORY_UNITS = Object.freeze({
  KG: 'kg',
  LITER: 'L',
  UNIT: 'unit',
  CUBIC_METER: 'm3',
  BAG: 'bag',
});

const MOVEMENT_TYPES = Object.freeze({
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
});

const SENSOR_TYPES = Object.freeze({
  SOIL_MOISTURE: 'soil_moisture',
  SOIL_TEMPERATURE: 'soil_temperature',
  AIR_TEMPERATURE: 'air_temperature',
  HUMIDITY: 'humidity',
  RAIN: 'rain',
  WIND: 'wind',
  LIGHT: 'light',
});

const SUBSCRIPTION_PLANS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
});

const SUBSCRIPTION_STATUSES = Object.freeze({
  ACTIVE: 'active',
  TRIAL: 'trial',
  SUSPENDED: 'suspended',
});

const LANGUAGES = Object.freeze({
  FR: 'fr',
  EN: 'en',
});

const DAYS_OF_WEEK = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
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
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  LANGUAGES,
  DAYS_OF_WEEK,
};
