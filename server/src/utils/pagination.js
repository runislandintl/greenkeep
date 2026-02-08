/**
 * Apply pagination to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Items per page
 * @param {string} options.sort - Sort field
 * @param {string} options.order - Sort order ('asc' or 'desc')
 * @returns {Object} { data, pagination }
 */
async function paginate(model, filter = {}, options = {}) {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const sort = options.sort || 'createdAt';
  const order = options.order === 'asc' ? 1 : -1;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(filter).sort({ [sort]: order }).skip(skip).limit(limit).lean(),
    model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

module.exports = { paginate };
