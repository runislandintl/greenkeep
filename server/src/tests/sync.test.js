import { describe, it, expect } from 'vitest';
import { SYNCABLE_COLLECTIONS } from '../services/sync.service';

describe('Sync Service', () => {
  describe('SYNCABLE_COLLECTIONS', () => {
    it('should include all expected collections', () => {
      expect(SYNCABLE_COLLECTIONS).toHaveProperty('zones');
      expect(SYNCABLE_COLLECTIONS).toHaveProperty('tasks');
      expect(SYNCABLE_COLLECTIONS).toHaveProperty('teamMembers');
      expect(SYNCABLE_COLLECTIONS).toHaveProperty('equipment');
      expect(SYNCABLE_COLLECTIONS).toHaveProperty('inventoryItems');
    });

    it('should have 5 syncable collections', () => {
      expect(Object.keys(SYNCABLE_COLLECTIONS).length).toBe(5);
    });
  });
});
