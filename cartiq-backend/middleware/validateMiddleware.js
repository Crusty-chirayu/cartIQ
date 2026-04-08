// c:\Users\chira\cartIQ\cartiq-backend\middleware\validateMiddleware.js
const { z } = require("zod");

/**
 * Validate request body against Zod schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }
  };
};

/**
 * Validate request query against Zod schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Query validation failed",
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
      });
    }
  };
};

/**
 * Validate request params against Zod schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.validatedParams = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Parameter validation failed",
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid parameters",
      });
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
