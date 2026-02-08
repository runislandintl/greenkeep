const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, _next) {
  // Log the error
  if (err.isOperational) {
    logger.warn(`API Error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: `Duplicate value for field: ${field}`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details.map((d) => d.message),
    });
  }

  // API Error (our custom errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Unknown errors
  return res.status(500).json({
    error: 'Internal server error',
  });
}

module.exports = errorHandler;
