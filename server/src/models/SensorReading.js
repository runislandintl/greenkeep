const mongoose = require('mongoose');
const { SENSOR_TYPES } = require('@greenkeep/shared/constants');

const sensorReadingSchema = new mongoose.Schema(
  {
    sensorId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(SENSOR_TYPES),
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      maxlength: 20,
    },
    readingAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

sensorReadingSchema.index({ sensorId: 1, readingAt: -1 });
sensorReadingSchema.index({ zoneId: 1, readingAt: -1 });
// TTL: auto-delete after 90 days
sensorReadingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

sensorReadingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = sensorReadingSchema;
