const mongoose = require('mongoose');
const { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES, RECURRENCE_PATTERNS } = require('@greenkeep/shared/constants');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    type: {
      type: String,
      enum: Object.values(TASK_TYPES),
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUSES),
      default: TASK_STATUSES.PENDING,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    assigneeIds: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      match: /^\d{2}:\d{2}$/,
      default: null,
    },
    estimatedDuration: {
      type: Number,
      min: 0,
      default: null,
    },
    actualDuration: {
      type: Number,
      min: 0,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    recurrence: {
      enabled: { type: Boolean, default: false },
      pattern: {
        type: String,
        enum: Object.values(RECURRENCE_PATTERNS),
        default: null,
      },
      interval: { type: Number, min: 1, default: null },
      endDate: { type: Date, default: null },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    },
    equipmentIds: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    inventoryUsed: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true, min: 0 },
    }],
    weatherDependency: {
      maxWind: { type: Number, default: null },
      noRain: { type: Boolean, default: false },
      minTemp: { type: Number, default: null },
      maxTemp: { type: Number, default: null },
    },
    photos: [{
      url: { type: String, required: true },
      caption: { type: String, default: '' },
    }],
    notes: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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

taskSchema.index({ status: 1 });
taskSchema.index({ scheduledDate: 1 });
taskSchema.index({ zoneId: 1 });
taskSchema.index({ assigneeIds: 1 });
taskSchema.index({ createdBy: 1 });

taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = taskSchema;
