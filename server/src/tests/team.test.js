import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as teamService from '../services/team.service';

describe('Team Service', () => {
  let tenantDb;
  const adminUserId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    tenantDb = mongoose.connection;
  });

  describe('createMember', () => {
    it('should create a team member', async () => {
      const memberUserId = new mongoose.Types.ObjectId();
      const member = await teamService.createMember(
        tenantDb,
        {
          userId: memberUserId,
          position: 'Head Greenkeeper',
          phone: '+33612345678',
          skills: ['mowing', 'irrigation', 'pest_control'],
        },
        adminUserId
      );

      expect(member).toBeDefined();
      expect(member.position).toBe('Head Greenkeeper');
      expect(member.skills).toContain('mowing');
      expect(member.isActive).toBe(true);
    });

    it('should reject duplicate user', async () => {
      const memberUserId = new mongoose.Types.ObjectId();
      await teamService.createMember(tenantDb, { userId: memberUserId, position: 'Assistant' }, adminUserId);

      await expect(
        teamService.createMember(tenantDb, { userId: memberUserId, position: 'Duplicate' }, adminUserId)
      ).rejects.toThrow('already a team member');
    });
  });

  describe('clockIn/clockOut', () => {
    it('should clock in and out', async () => {
      const memberUserId = new mongoose.Types.ObjectId();
      const member = await teamService.createMember(tenantDb, { userId: memberUserId, position: 'Worker' }, adminUserId);

      const clockInEntry = await teamService.clockIn(tenantDb, member._id);
      expect(clockInEntry.clockIn).toBeDefined();
      expect(clockInEntry.clockOut).toBeNull();

      const clockOutEntry = await teamService.clockOut(tenantDb, member._id, { breakMinutes: 30 });
      expect(clockOutEntry.clockOut).toBeDefined();
      expect(clockOutEntry.breakMinutes).toBe(30);
    });

    it('should reject double clock-in', async () => {
      const memberUserId = new mongoose.Types.ObjectId();
      const member = await teamService.createMember(tenantDb, { userId: memberUserId, position: 'Double Clock' }, adminUserId);

      await teamService.clockIn(tenantDb, member._id);

      await expect(teamService.clockIn(tenantDb, member._id)).rejects.toThrow('Already clocked in');
    });
  });
});
