const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      maxlength: 100,
    },
    targetCollection: {
      type: String,
      required: true,
      maxlength: 50,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null },
      after: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetCollection: 1, targetId: 1 });

auditLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = auditLogSchema;
