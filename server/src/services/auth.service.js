const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const SALT_ROUNDS = 12;

function getUser() {
  return mongoose.model('User');
}

/**
 * Hash a password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user._id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
}

/**
 * Login user
 */
async function login(email, password) {
  const User = getUser();
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

/**
 * Register new user (superadmin only)
 */
async function register(userData) {
  const User = getUser();

  const existing = await User.findOne({ email: userData.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await hashPassword(userData.password);

  const user = await User.create({
    email: userData.email.toLowerCase(),
    passwordHash,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    tenantId: userData.tenantId || null,
    lang: userData.lang || 'fr',
  });

  return user.toJSON();
}

/**
 * Refresh access token
 */
async function refreshToken(token) {
  try {
    const payload = jwt.verify(token, env.jwt.refreshSecret);
    const User = getUser();
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
}

/**
 * Change password
 */
async function changePassword(userId, currentPassword, newPassword) {
  const User = getUser();
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
}

/**
 * Update user profile
 */
async function updateProfile(userId, updates) {
  const User = getUser();
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (updates.firstName) user.firstName = updates.firstName;
  if (updates.lastName) user.lastName = updates.lastName;
  if (updates.lang) user.lang = updates.lang;
  if (updates.avatar !== undefined) user.avatar = updates.avatar;

  await user.save();
  return user.toJSON();
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  login,
  register,
  refreshToken,
  changePassword,
  updateProfile,
};
