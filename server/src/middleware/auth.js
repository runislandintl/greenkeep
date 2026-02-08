const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { ROLES, ROLE_HIERARCHY } = require('@greenkeep/shared/constants');

// User model (will be registered on global connection)
let User;

function getUser() {
  if (!User) {
    User = mongoose.model('User');
  }
  return User;
}

// Configure Passport JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const UserModel = getUser();
      const user = await UserModel.findById(payload.sub).lean();
      if (!user || !user.isActive) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

/**
 * Authenticate request via JWT
 */
function authenticate(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    req.user = user;
    next();
  })(req, res, next);
}

/**
 * Authorize request by role
 * @param  {...string} allowedRoles - Roles that can access this route
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

/**
 * Require minimum role level
 * @param {string} minRole - Minimum role required
 */
function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 999;
    if (userLevel < requiredLevel) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}

module.exports = {
  passport,
  authenticate,
  authorize,
  requireRole,
};
