// c:\Users\chira\cartIQ\cartiq-backend\utils\apiResponse.js

/**
 * Standardized API response builder
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

/**
 * Build success response
 */
const successResponse = (data, message = "Success", statusCode = 200) => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Build error response
 */
const errorResponse = (message = "Error", statusCode = 400, data = null) => {
  return {
    success: false,
    message,
    data,
  };
};

/**
 * Format response with pagination
 */
const paginatedResponse = (data, page, limit, total, message = "Success") => {
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  ApiResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
};
