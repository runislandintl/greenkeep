const mongoose = require('mongoose');
const { EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } = require('../../../shared/constants');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: Object.values(EQUIPMENT_CATEGORIES),
      required: true,
    },
    brand: {
      type: String,
      maxlength: 100,
      default: null,
    },
    model: {
      type: String,
      maxlength: 100,
      default: null,
    },
    serialNumber: {
      type: String,
      maxlength: 100,
      default: null,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    lastServiceDate: {
      type: Date,
      default: null,
    },
    nextServiceDate: {
      type: Date,
      default: null,
    },
    hoursUsed: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(EQUIPMENT_STATUSES),
      default: EQUIPMENT_STATUSES.AVAILABLE,
    },
    location: {
      type: String,
      maxlength: 200,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 2000,
      default: '',
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

equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });

equipmentSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = equipmentSchema;
