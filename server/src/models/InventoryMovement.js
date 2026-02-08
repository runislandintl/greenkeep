const mongoose = require('mongoose');
const { MOVEMENT_TYPES } = require('@greenkeep/shared/constants');

const inventoryMovementSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MOVEMENT_TYPES),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

inventoryMovementSchema.index({ itemId: 1 });
inventoryMovementSchema.index({ createdAt: -1 });

inventoryMovementSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = inventoryMovementSchema;
