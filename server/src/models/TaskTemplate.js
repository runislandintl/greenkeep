const mongoose = require('mongoose');
const { TASK_TYPES, TASK_PRIORITIES, RECURRENCE_PATTERNS } = require('../../../shared/constants');

const taskTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: Object.values(TASK_TYPES),
      required: true,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    estimatedDuration: {
      type: Number,
      min: 0,
      default: null,
    },
    defaultPriority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
    },
    defaultRecurrence: {
      enabled: { type: Boolean, default: false },
      pattern: {
        type: String,
        enum: Object.values(RECURRENCE_PATTERNS),
        default: null,
      },
      interval: { type: Number, min: 1, default: null },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    },
    equipmentIds: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    inventoryNeeded: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true, min: 0 },
    }],
  },
  {
    timestamps: true,
  }
);

taskTemplateSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = taskTemplateSchema;
