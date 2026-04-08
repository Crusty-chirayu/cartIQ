// c:\Users\chira\cartIQ\cartiq-backend\utils\logger.js
const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Simple logger utility
 */
const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage);
    fs.appendFileSync(path.join(logsDir, "app.log"), logMessage + "\n");
  },

  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const errorStack = error ? `\n${error.stack}` : "";
    const logMessage = `[${timestamp}] ERROR: ${message}${errorStack}`;
    console.error(logMessage);
    fs.appendFileSync(path.join(logsDir, "error.log"), logMessage + "\n");
  },

  warn: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    console.warn(logMessage);
    fs.appendFileSync(path.join(logsDir, "app.log"), logMessage + "\n");
  },

  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}`;
      console.log(logMessage);
    }
  },
};

module.exports = logger;
