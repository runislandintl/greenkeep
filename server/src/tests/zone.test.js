import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as zoneService from '../services/zone.service';

describe('Zone Service', () => {
  let tenantDb;

  beforeAll(() => {
    // Use default connection as tenant DB for testing
    tenantDb = mongoose.connection;
  });

  describe('createZone', () => {
    it('should create a new zone', async () => {
      const userId = new mongoose.Types.ObjectId();
      const zone = await zoneService.createZone(
        tenantDb,
        {
          name: 'Green Trou 1',
          type: 'green',
          holeNumber: 1,
          area: 500,
          health: 'good',
          grassType: 'Agrostis',
        },
        userId
      );

      expect(zone).toBeDefined();
      expect(zone.name).toBe('Green Trou 1');
      expect(zone.type).toBe('green');
      expect(zone.holeNumber).toBe(1);
      expect(zone.health).toBe('good');
      expect(zone.isActive).toBe(true);
      expect(zone._syncVersion).toBe(1);
    });
  });

  describe('listZones', () => {
    it('should list active zones', async () => {
      const userId = new mongoose.Types.ObjectId();
      await zoneService.createZone(tenantDb, { name: 'Green 1', type: 'green', health: 'good' }, userId);
      await zoneService.createZone(tenantDb, { name: 'Fairway 1', type: 'fairway', health: 'excellent' }, userId);

      const result = await zoneService.listZones(tenantDb);
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by type', async () => {
      const userId = new mongoose.Types.ObjectId();
      await zoneService.createZone(tenantDb, { name: 'Green A', type: 'green', health: 'good' }, userId);
      await zoneService.createZone(tenantDb, { name: 'Bunker A', type: 'bunker', health: 'fair' }, userId);

      const result = await zoneService.listZones(tenantDb, { type: 'green' });
      expect(result.data.length).toBe(1);
      expect(result.data[0].type).toBe('green');
    });
  });

  describe('updateZoneHealth', () => {
    it('should update zone health and increment sync version', async () => {
      const userId = new mongoose.Types.ObjectId();
      const zone = await zoneService.createZone(tenantDb, { name: 'Test Zone', type: 'green', health: 'good' }, userId);

      const updated = await zoneService.updateZoneHealth(
        tenantDb,
        zone._id,
        { health: 'excellent' },
        userId
      );

      expect(updated.health).toBe('excellent');
      expect(updated._syncVersion).toBe(2);
    });
  });

  describe('deleteZone', () => {
    it('should soft-delete a zone', async () => {
      const userId = new mongoose.Types.ObjectId();
      const zone = await zoneService.createZone(tenantDb, { name: 'To Delete', type: 'rough', health: 'fair' }, userId);

      await zoneService.deleteZone(tenantDb, zone._id, userId);

      // Should not appear in active zones list
      const result = await zoneService.listZones(tenantDb);
      const found = result.data.find((z) => z._id.toString() === zone._id.toString());
      expect(found).toBeUndefined();
    });
  });

  describe('getZonesGeoJSON', () => {
    it('should return GeoJSON FeatureCollection', async () => {
      const userId = new mongoose.Types.ObjectId();
      await zoneService.createZone(
        tenantDb,
        {
          name: 'Geo Zone',
          type: 'green',
          health: 'good',
          geometry: {
            type: 'Polygon',
            coordinates: [[[2.35, 48.85], [2.36, 48.85], [2.36, 48.86], [2.35, 48.86], [2.35, 48.85]]],
          },
        },
        userId
      );

      const geojson = await zoneService.getZonesGeoJSON(tenantDb);
      expect(geojson.type).toBe('FeatureCollection');
      expect(geojson.features.length).toBeGreaterThanOrEqual(1);
      expect(geojson.features[0].properties.name).toBe('Geo Zone');
    });
  });
});
