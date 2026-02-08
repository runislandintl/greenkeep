import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as equipmentService from '../services/equipment.service';

describe('Equipment Service', () => {
  let tenantDb;
  const userId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    tenantDb = mongoose.connection;
  });

  describe('createEquipment', () => {
    it('should create equipment', async () => {
      const equipment = await equipmentService.createEquipment(
        tenantDb,
        {
          name: 'Tondeuse John Deere 2500A',
          category: 'mower',
          brand: 'John Deere',
          model: '2500A',
          serialNumber: 'JD2500A-001',
          status: 'available',
        },
        userId
      );

      expect(equipment).toBeDefined();
      expect(equipment.name).toBe('Tondeuse John Deere 2500A');
      expect(equipment.category).toBe('mower');
      expect(equipment.status).toBe('available');
    });
  });

  describe('updateEquipmentStatus', () => {
    it('should change equipment status', async () => {
      const equipment = await equipmentService.createEquipment(
        tenantDb,
        { name: 'Tracteur', category: 'tractor', status: 'available' },
        userId
      );

      const updated = await equipmentService.updateEquipmentStatus(
        tenantDb, equipment._id, 'in_use', userId
      );

      expect(updated.status).toBe('in_use');
      expect(updated._syncVersion).toBe(2);
    });
  });

  describe('listEquipment', () => {
    it('should filter by category', async () => {
      await equipmentService.createEquipment(tenantDb, { name: 'Mower 1', category: 'mower' }, userId);
      await equipmentService.createEquipment(tenantDb, { name: 'Sprayer 1', category: 'sprayer' }, userId);

      const result = await equipmentService.listEquipment(tenantDb, { category: 'mower' });
      expect(result.data.every((e) => e.category === 'mower')).toBe(true);
    });
  });

  describe('deleteEquipment', () => {
    it('should soft delete equipment', async () => {
      const equipment = await equipmentService.createEquipment(
        tenantDb, { name: 'To Retire', category: 'hand_tool' }, userId
      );

      await equipmentService.deleteEquipment(tenantDb, equipment._id, userId);

      const result = await equipmentService.listEquipment(tenantDb);
      const found = result.data.find((e) => e._id.toString() === equipment._id.toString());
      expect(found).toBeUndefined();
    });
  });
});
