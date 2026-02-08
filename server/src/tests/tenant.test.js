import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as tenantService from '../services/tenant.service';

describe('Tenant Service', () => {
  describe('createTenant', () => {
    it('should create a new tenant', async () => {
      const tenant = await tenantService.createTenant({
        name: 'Golf de Lyon',
        slug: 'golf-de-lyon',
        timezone: 'Europe/Paris',
      });

      expect(tenant).toBeDefined();
      expect(tenant.name).toBe('Golf de Lyon');
      expect(tenant.slug).toBe('golf-de-lyon');
      expect(tenant.isActive).toBe(true);
      expect(tenant.featureFlags.zones).toBe(true);
    });

    it('should reject duplicate slug', async () => {
      await tenantService.createTenant({
        name: 'Golf A',
        slug: 'duplicate-slug',
      });

      await expect(
        tenantService.createTenant({
          name: 'Golf B',
          slug: 'duplicate-slug',
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('listTenants', () => {
    it('should list all tenants', async () => {
      await tenantService.createTenant({ name: 'Golf 1', slug: 'golf-1' });
      await tenantService.createTenant({ name: 'Golf 2', slug: 'golf-2' });

      const result = await tenantService.listTenants();
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should search tenants by name', async () => {
      await tenantService.createTenant({ name: 'Golf de Paris', slug: 'golf-paris' });
      await tenantService.createTenant({ name: 'Country Club', slug: 'country-club' });

      const result = await tenantService.listTenants({ search: 'Paris' });
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('Golf de Paris');
    });
  });

  describe('deactivateTenant', () => {
    it('should deactivate a tenant', async () => {
      const tenant = await tenantService.createTenant({ name: 'To Deactivate', slug: 'deactivate-me' });
      const deactivated = await tenantService.deactivateTenant(tenant._id);
      expect(deactivated.isActive).toBe(false);
    });
  });
});
