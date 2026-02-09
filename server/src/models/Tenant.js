const mongoose = require('mongoose');
const { LANGUAGES, SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUSES } = require('../../../shared/constants');
const { FEATURE_FLAG_DEFAULTS } = require('../../../shared/featureFlagDefaults');

const tenantSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    timezone: {
      type: String,
      default: 'Europe/Paris',
    },
    logo: {
      type: String,
      default: null,
    },
    settings: {
      defaultLang: {
        type: String,
        enum: Object.values(LANGUAGES),
        default: LANGUAGES.FR,
      },
      mapCenter: {
        lat: { type: Number, default: 46.603354 },
        lng: { type: Number, default: 1.888334 },
      },
      mapZoom: {
        type: Number,
        default: 15,
        min: 1,
        max: 22,
      },
      weatherLocation: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
      currency: {
        type: String,
        default: 'EUR',
      },
    },
    featureFlags: {
      zones: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.zones },
      tasks: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.tasks },
      team: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.team },
      equipment: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.equipment },
      inventory: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.inventory },
      weather: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.weather },
      iot: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.iot },
      calendar: { type: Boolean, default: FEATURE_FLAG_DEFAULTS.calendar },
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SUBSCRIPTION_PLANS),
        default: SUBSCRIPTION_PLANS.FREE,
      },
      status: {
        type: String,
        enum: Object.values(SUBSCRIPTION_STATUSES),
        default: SUBSCRIPTION_STATUSES.TRIAL,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ slug: 1 });

tenantSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Tenant', tenantSchema);
