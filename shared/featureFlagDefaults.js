/**
 * GreenKeep feature flag defaults
 * Each module can be toggled on/off per tenant
 */

const FEATURE_FLAG_DEFAULTS = Object.freeze({
  zones: true,
  tasks: true,
  team: true,
  equipment: true,
  inventory: true,
  weather: true,
  iot: false,
  calendar: false,
});

const FEATURE_FLAG_DESCRIPTIONS = Object.freeze({
  zones: { en: 'Zone Management', fr: 'Gestion des zones' },
  tasks: { en: 'Maintenance Planning', fr: 'Planning d\'entretien' },
  team: { en: 'Team Management', fr: 'Gestion des equipes' },
  equipment: { en: 'Equipment Registry', fr: 'Registre des equipements' },
  inventory: { en: 'Inventory & Stock', fr: 'Inventaire & Stock' },
  weather: { en: 'Weather Integration', fr: 'Integration meteo' },
  iot: { en: 'IoT Sensors (Experimental)', fr: 'Capteurs IoT (Experimental)' },
  calendar: { en: 'Calendar Sync (Experimental)', fr: 'Sync Calendrier (Experimental)' },
});

module.exports = {
  FEATURE_FLAG_DEFAULTS,
  FEATURE_FLAG_DESCRIPTIONS,
};
