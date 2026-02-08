import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as inventoryService from '../services/inventory.service';

describe('Inventory Service', () => {
  let tenantDb;
  const userId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    tenantDb = mongoose.connection;
  });

  describe('createItem', () => {
    it('should create an inventory item', async () => {
      const item = await inventoryService.createItem(
        tenantDb,
        {
          name: 'Engrais NPK 15-15-15',
          category: 'fertilizer',
          unit: 'kg',
          currentStock: 500,
          minStock: 100,
          supplier: 'AgroFrance',
        },
        userId
      );

      expect(item).toBeDefined();
      expect(item.name).toBe('Engrais NPK 15-15-15');
      expect(item.currentStock).toBe(500);
      expect(item.minStock).toBe(100);
    });
  });

  describe('recordMovement', () => {
    it('should record stock out and decrease stock', async () => {
      const item = await inventoryService.createItem(
        tenantDb,
        { name: 'Sand', category: 'sand', unit: 'kg', currentStock: 1000, minStock: 200 },
        userId
      );

      const result = await inventoryService.recordMovement(
        tenantDb,
        item._id,
        { type: 'out', quantity: 300, reason: 'Top dressing bunker 5' },
        userId
      );

      expect(result.item.currentStock).toBe(700);
      expect(result.movement.type).toBe('out');
      expect(result.movement.quantity).toBe(300);
    });

    it('should reject insufficient stock', async () => {
      const item = await inventoryService.createItem(
        tenantDb,
        { name: 'Fuel', category: 'fuel', unit: 'L', currentStock: 50, minStock: 10 },
        userId
      );

      await expect(
        inventoryService.recordMovement(
          tenantDb,
          item._id,
          { type: 'out', quantity: 100, reason: 'Too much' },
          userId
        )
      ).rejects.toThrow('Insufficient stock');
    });

    it('should record stock in and increase stock', async () => {
      const item = await inventoryService.createItem(
        tenantDb,
        { name: 'Seeds', category: 'seed', unit: 'kg', currentStock: 100, minStock: 50 },
        userId
      );

      const result = await inventoryService.recordMovement(
        tenantDb,
        item._id,
        { type: 'in', quantity: 200, reason: 'Delivery from supplier' },
        userId
      );

      expect(result.item.currentStock).toBe(300);
    });
  });

  describe('getLowStockAlerts', () => {
    it('should return items below minimum stock', async () => {
      await inventoryService.createItem(
        tenantDb,
        { name: 'Low Item', category: 'herbicide', unit: 'L', currentStock: 5, minStock: 20 },
        userId
      );
      await inventoryService.createItem(
        tenantDb,
        { name: 'OK Item', category: 'fungicide', unit: 'L', currentStock: 100, minStock: 10 },
        userId
      );

      const alerts = await inventoryService.getLowStockAlerts(tenantDb);
      const lowItem = alerts.find((a) => a.name === 'Low Item');
      const okItem = alerts.find((a) => a.name === 'OK Item');

      expect(lowItem).toBeDefined();
      expect(okItem).toBeUndefined();
    });
  });
});
