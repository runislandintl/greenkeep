import { describe, it, expect } from 'vitest';
import { resolveFlags, isFeatureEnabled } from '../config/featureFlags';

describe('Feature Flags', () => {
  describe('resolveFlags', () => {
    it('should return defaults when no overrides', () => {
      const flags = resolveFlags();
      expect(flags.zones).toBe(true);
      expect(flags.tasks).toBe(true);
      expect(flags.team).toBe(true);
      expect(flags.equipment).toBe(true);
      expect(flags.inventory).toBe(true);
      expect(flags.weather).toBe(true);
      expect(flags.iot).toBe(false);
      expect(flags.calendar).toBe(false);
    });

    it('should merge tenant overrides with defaults', () => {
      const flags = resolveFlags({ zones: false, iot: true });
      expect(flags.zones).toBe(false);
      expect(flags.iot).toBe(true);
      expect(flags.tasks).toBe(true); // unchanged default
    });

    it('should handle null overrides', () => {
      const flags = resolveFlags(null);
      expect(flags.zones).toBe(true);
    });

    it('should handle empty overrides', () => {
      const flags = resolveFlags({});
      expect(flags.zones).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', () => {
      expect(isFeatureEnabled({}, 'zones')).toBe(true);
    });

    it('should return false for disabled feature', () => {
      expect(isFeatureEnabled({ zones: false }, 'zones')).toBe(false);
    });

    it('should return false for experimental features by default', () => {
      expect(isFeatureEnabled({}, 'iot')).toBe(false);
      expect(isFeatureEnabled({}, 'calendar')).toBe(false);
    });

    it('should return true for experimental features when enabled', () => {
      expect(isFeatureEnabled({ iot: true }, 'iot')).toBe(true);
    });
  });
});
