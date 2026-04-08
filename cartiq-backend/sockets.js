const socketIo = require("socket.io");
const logger = require("./utils/logger");

/**
 * Socket.io setup for real-time features
 * Handles notifications, chat, order updates, and live features
 */
const setupSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Middleware to verify socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn("Socket connection attempt without token");
      return next(new Error("Authentication error"));
    }
    next();
  });

  // Connection handler
  io.on("connection", (socket) => {
    logger.info(`👤 User connected: ${socket.id}`);

    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(`notifications:${userId}`);
      logger.info(`✅ User ${userId} joined personal room`);
    }

    // Join support room (for support staff)
    socket.on("join-support", () => {
      socket.join("support-team");
      logger.info(`👥 Support staff joined: ${socket.id}`);
    });

    // Join seller room
    socket.on("join-seller", (sellerId) => {
      socket.join(`seller:${sellerId}`);
      logger.info(`🏪 Seller ${sellerId} joined room`);
    });

    // Join admin room
    socket.on("join-admin", () => {
      socket.join("admin-panel");
      logger.info(`⚙️ Admin joined panel`);
    });

    // Real-time order updates
    socket.on("order-status-update", (data) => {
      const { orderId, status, userId: targetUserId, sellerId } = data;
      io.to(`user:${targetUserId}`).emit("order-updated", {
        orderId,
        status,
        timestamp: new Date(),
      });
      io.to(`seller:${sellerId}`).emit("seller-order-updated", {
        orderId,
        status,
        timestamp: new Date(),
      });
      logger.info(`📦 Order ${orderId} status updated to ${status}`);
    });

    // Real-time notifications
    socket.on("send-notification", (data) => {
      const { userId: targetUserId, type, message, data: notifData } = data;
      io.to(`notifications:${targetUserId}`).emit("notification", {
        type,
        message,
        data: notifData,
        timestamp: new Date(),
      });
      logger.info(`🔔 Notification sent to user ${targetUserId}`);
    });

    // Chat message (for support)
    socket.on("support-message", (data) => {
      const { ticketId, message, userId: senderUserId } = data;
      io.to("support-team").emit("new-support-message", {
        ticketId,
        message,
        sender: senderUserId,
        timestamp: new Date(),
      });
      logger.info(`💬 Support message sent on ticket ${ticketId}`);
    });

    // Broadcast to admin panel
    socket.on("admin-alert", (data) => {
      io.to("admin-panel").emit("admin-notification", {
        type: data.type,
        message: data.message,
        timestamp: new Date(),
      });
      logger.info(`⚠️ Admin alert: ${data.type}`);
    });

    // Real-time inventory update
    socket.on("inventory-update", (data) => {
      const { productId, quantity } = data;
      io.emit("product-inventory-changed", {
        productId,
        quantity,
        timestamp: new Date(),
      });
      logger.info(`📊 Inventory updated for product ${productId}`);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      logger.info(`👤 User disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on("error", (error) => {
      logger.error(`❌ Socket error: ${socket.id}`, error);
    });
  });

  return io;
};

module.exports = setupSocket;
