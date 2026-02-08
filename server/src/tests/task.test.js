import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

import '../models/User';
import '../models/Tenant';

import * as taskService from '../services/task.service';

describe('Task Service', () => {
  let tenantDb;
  const userId = new mongoose.Types.ObjectId();

  beforeAll(() => {
    tenantDb = mongoose.connection;
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const task = await taskService.createTask(
        tenantDb,
        {
          title: 'Tonte Green 1',
          type: 'mowing',
          priority: 'high',
          scheduledDate: new Date('2026-03-01'),
          estimatedDuration: 120,
        },
        userId
      );

      expect(task).toBeDefined();
      expect(task.title).toBe('Tonte Green 1');
      expect(task.type).toBe('mowing');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
      expect(task._syncVersion).toBe(1);
    });
  });

  describe('listTasks', () => {
    it('should list tasks', async () => {
      await taskService.createTask(tenantDb, { title: 'Task 1', type: 'mowing', scheduledDate: new Date() }, userId);
      await taskService.createTask(tenantDb, { title: 'Task 2', type: 'watering', scheduledDate: new Date() }, userId);

      const result = await taskService.listTasks(tenantDb);
      expect(result.data.length).toBe(2);
    });

    it('should filter by status', async () => {
      await taskService.createTask(tenantDb, { title: 'Pending', type: 'mowing', scheduledDate: new Date(), status: 'pending' }, userId);

      const result = await taskService.listTasks(tenantDb, { status: 'pending' });
      expect(result.data.every((t) => t.status === 'pending')).toBe(true);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status to completed', async () => {
      const task = await taskService.createTask(tenantDb, { title: 'To Complete', type: 'inspection', scheduledDate: new Date() }, userId);

      const updated = await taskService.updateTaskStatus(
        tenantDb,
        task._id,
        { status: 'completed', actualDuration: 45 },
        userId
      );

      expect(updated.status).toBe('completed');
      expect(updated.actualDuration).toBe(45);
      expect(updated.completedAt).toBeDefined();
      expect(updated.completedBy.toString()).toBe(userId.toString());
      expect(updated._syncVersion).toBe(2);
    });
  });

  describe('cancelTask', () => {
    it('should cancel a task', async () => {
      const task = await taskService.createTask(tenantDb, { title: 'To Cancel', type: 'repair', scheduledDate: new Date() }, userId);

      const cancelled = await taskService.cancelTask(tenantDb, task._id, userId);
      expect(cancelled.status).toBe('cancelled');
    });
  });

  describe('templates', () => {
    it('should create and list templates', async () => {
      await taskService.createTemplate(tenantDb, {
        name: 'Weekly Mowing',
        type: 'mowing',
        estimatedDuration: 120,
        defaultPriority: 'medium',
      });

      const templates = await taskService.listTemplates(tenantDb);
      expect(templates.length).toBeGreaterThanOrEqual(1);
      expect(templates[0].name).toBe('Weekly Mowing');
    });
  });
});
