const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    forecast: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL: auto-delete cached weather after 1 hour
weatherCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 3600 });
weatherCacheSchema.index({ date: 1 });

weatherCacheSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = weatherCacheSchema;
