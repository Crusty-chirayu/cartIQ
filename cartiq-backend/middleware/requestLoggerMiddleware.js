// c:\Users\chira\cartIQ\cartiq-backend\middleware\requestLoggerMiddleware.js
const morgan = require("morgan");
const logger = require("../utils/logger");

/**
 * Custom morgan token for user ID
 */
morgan.token("user-id", (req) => {
  return req.user ? req.user._id : "anonymous";
});

/**
 * Create write stream for Morgan
 */
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

/**
 * Morgan format for development
 */
const devFormat = ":method :url :status :response-time ms - :user-id";

/**
 * Morgan format for production
 */
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

/**
 * Initialize logger middleware
 */
const requestLogger = (env = process.env.NODE_ENV || "development") => {
  if (env === "development") {
    return morgan(devFormat);
  }

  return morgan(prodFormat, { stream: morganStream });
};

module.exports = requestLogger;
