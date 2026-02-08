const ApiError = require('../utils/apiError');

/**
 * Validate request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return next(ApiError.badRequest('Validation failed', details));
    }

    // Replace the request property with validated/cleaned value
    req[property] = value;
    next();
  };
}

module.exports = validate;
