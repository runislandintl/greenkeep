import { describe, it, expect, beforeAll } from 'vitest';
import './setup';
import mongoose from 'mongoose';

// Register models
import '../models/User';
import '../models/Tenant';

import * as authService from '../services/auth.service';

describe('Auth Service', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await authService.hashPassword('testPassword123');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('testPassword123');
      expect(hash.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const hash = await authService.hashPassword('testPassword123');
      const match = await authService.comparePassword('testPassword123', hash);
      expect(match).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await authService.hashPassword('testPassword123');
      const match = await authService.comparePassword('wrongPassword', hash);
      expect(match).toBe(false);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const user = await authService.register({
        email: 'test@greenkeep.com',
        password: 'testPassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe('test@greenkeep.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe('admin');
      expect(user.passwordHash).toBeUndefined(); // Should be removed from JSON
    });

    it('should reject duplicate email', async () => {
      await authService.register({
        email: 'duplicate@greenkeep.com',
        password: 'testPassword123',
        firstName: 'First',
        lastName: 'User',
        role: 'team',
      });

      await expect(
        authService.register({
          email: 'duplicate@greenkeep.com',
          password: 'testPassword456',
          firstName: 'Second',
          lastName: 'User',
          role: 'team',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      await authService.register({
        email: 'login@greenkeep.com',
        password: 'testPassword123',
        firstName: 'Login',
        lastName: 'User',
        role: 'admin',
      });

      const result = await authService.login('login@greenkeep.com', 'testPassword123');
      expect(result).toBeDefined();
      expect(result.user.email).toBe('login@greenkeep.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      await authService.register({
        email: 'wrongpass@greenkeep.com',
        password: 'testPassword123',
        firstName: 'Wrong',
        lastName: 'Pass',
        role: 'team',
      });

      await expect(
        authService.login('wrongpass@greenkeep.com', 'wrongPassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      await expect(
        authService.login('nonexistent@greenkeep.com', 'testPassword123')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT', () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'token@greenkeep.com',
        role: 'admin',
        tenantId: null,
      };

      const token = authService.generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });
  });
});
