const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    breakMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      maxlength: 2000,
      default: '',
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

timeEntrySchema.index({ memberId: 1 });
timeEntrySchema.index({ taskId: 1 });
timeEntrySchema.index({ clockIn: -1 });

// Virtual for duration in minutes
timeEntrySchema.virtual('durationMinutes').get(function () {
  if (!this.clockOut) return null;
  const diff = this.clockOut.getTime() - this.clockIn.getTime();
  return Math.round(diff / 60000) - this.breakMinutes;
});

timeEntrySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = timeEntrySchema;
