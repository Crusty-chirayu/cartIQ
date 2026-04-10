require("dotenv").config();

const app = require("./app");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

// ✅ REAL MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// (optional) Redis disabled for now
const redisClient = {
  quit: async () => {},
};

logger.warn("⚠️ Redis disabled (dev mode)");

// Create server
const server = require("http").createServer(app);

// Initialize server
const initializeServer = async () => {
  try {
    // ✅ CONNECT DATABASE
    await connectDB();

    // Socket (safe)
    try {
      const setupSocket = require("./sockets");
      setupSocket(server);
      logger.info("Socket.io initialized");
    } catch (err) {
      logger.warn("Socket.io skipped");
    }

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

  } catch (error) {
    logger.error("Server failed:", error.message);
    process.exit(1);
  }
};

initializeServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("Shutting down...");

  server.close(async () => {
    await redisClient.quit();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Exiting.");
  process.exit(0);
});

// Handle unhandled errors
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
});

module.exports = { server, redisClient, app };