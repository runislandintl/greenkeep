const mongoose = require('mongoose');
const { ZONE_TYPES, ZONE_HEALTH } = require('@greenkeep/shared/constants');

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: Object.values(ZONE_TYPES),
      required: true,
    },
    holeNumber: {
      type: Number,
      min: 1,
      max: 36,
      default: null,
    },
    area: {
      type: Number,
      min: 0,
      default: null,
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]],
        default: undefined,
      },
    },
    health: {
      type: String,
      enum: Object.values(ZONE_HEALTH),
      default: ZONE_HEALTH.GOOD,
    },
    grassType: {
      type: String,
      maxlength: 100,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    lastMaintenanceAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    _syncVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

zoneSchema.index({ type: 1 });
zoneSchema.index({ holeNumber: 1 });
zoneSchema.index({ health: 1 });
zoneSchema.index({ geometry: '2dsphere' });

zoneSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// This schema is used per-tenant via getTenantModel
module.exports = zoneSchema;
