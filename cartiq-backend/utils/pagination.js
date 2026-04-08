// c:\Users\chira\cartIQ\cartiq-backend\utils\pagination.js

/**
 * Parse pagination parameters from query
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit) || 20), 100); // Max 100 per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Calculate pagination metadata
 */
const getPaginationMetadata = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPagination,
  getPaginationMetadata,
};
