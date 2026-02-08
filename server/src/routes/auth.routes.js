const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('@greenkeep/shared/validation');

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/register (superadmin only)
router.post('/register', authenticate, validate(registerSchema), async (req, res, next) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmin can register users' });
    }
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, (req, res) => {
  const { passwordHash, ...user } = req.user;
  res.json(user);
});

// PUT /api/v1/auth/me
router.put('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/auth/me/password
router.put(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      await authService.changePassword(
        req.user._id,
        req.body.currentPassword,
        req.body.newPassword
      );
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
