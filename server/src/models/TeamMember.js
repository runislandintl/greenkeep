const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    start: { type: String, match: /^\d{2}:\d{2}$/ },
    end: { type: String, match: /^\d{2}:\d{2}$/ },
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    position: {
      type: String,
      maxlength: 200,
      default: '',
    },
    phone: {
      type: String,
      default: null,
    },
    skills: [{
      type: String,
      maxlength: 100,
    }],
    certifications: [{
      name: { type: String, required: true, maxlength: 200 },
      expiresAt: { type: Date, default: null },
    }],
    availability: {
      mon: { type: timeSlotSchema, default: null },
      tue: { type: timeSlotSchema, default: null },
      wed: { type: timeSlotSchema, default: null },
      thu: { type: timeSlotSchema, default: null },
      fri: { type: timeSlotSchema, default: null },
      sat: { type: timeSlotSchema, default: null },
      sun: { type: timeSlotSchema, default: null },
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

teamMemberSchema.index({ userId: 1 });
teamMemberSchema.index({ isActive: 1 });

teamMemberSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = teamMemberSchema;
