const mongoose = require('mongoose');
const { INVENTORY_CATEGORIES, INVENTORY_UNITS } = require('@greenkeep/shared/constants');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: Object.values(INVENTORY_CATEGORIES),
      required: true,
    },
    unit: {
      type: String,
      enum: Object.values(INVENTORY_UNITS),
      required: true,
    },
    currentStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    minStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxStock: {
      type: Number,
      min: 0,
      default: null,
    },
    location: {
      type: String,
      maxlength: 200,
      default: null,
    },
    supplier: {
      type: String,
      maxlength: 200,
      default: null,
    },
    unitCost: {
      type: Number,
      min: 0,
      default: null,
    },
    safetyDataSheet: {
      type: String,
      default: null,
    },
    expirationDate: {
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

inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ currentStock: 1 });

// Virtual to check if stock is low
inventoryItemSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.minStock;
});

inventoryItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = inventoryItemSchema;
