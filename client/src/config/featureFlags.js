/**
 * Client-side feature flag defaults
 * These are overridden by server-side tenant flags
 */
export const FEATURE_FLAG_DEFAULTS = {
  zones: true,
  tasks: true,
  team: true,
  equipment: true,
  inventory: true,
  weather: true,
  iot: false,
  calendar: false,
};
