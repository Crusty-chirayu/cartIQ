// c:\Users\chira\cartIQ\cartiq-backend\sockets\index.js
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Connection event
  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // =============== ORDER EVENTS ===============
    socket.on("order:created", (data) => {
      // Broadcast to admin/seller
      io.to(`role:admin`).emit("order:created", {
        orderId: data.orderId,
        sellerId: data.sellerId,
        timestamp: new Date(),
      });
      io.to(`seller:${data.sellerId}`).emit("order:incoming", data);
    });

    socket.on("order:status_update", (data) => {
      // Notify customer
      io.to(`user:${data.userId}`).emit("order:status_updated", {
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    // =============== SUPPORT TICKET EVENTS ===============
    socket.on("support:new_message", (data) => {
      if (socket.userRole === "admin") {
        // Send to customer
        io.to(`user:${data.userId}`).emit(
          "support:new_message",
          data
        );
      } else {
        // Send to admin/support
        io.to(`role:admin`).emit("support:new_message", data);
      }
    });

    // =============== NOTIFICATION EVENTS ===============
    socket.on("notification:send", (data) => {
      io.to(`user:${data.userId}`).emit("notification:new", {
        id: data.id,
        type: data.type,
        message: data.message,
        timestamp: new Date(),
      });
    });

    socket.on("notification:read", (data) => {
      io.to(`user:${socket.userId}`).emit(
        "notification:read",
        { notificationId: data.id }
      );
    });

    // =============== INVENTORY EVENTS ===============
    socket.on("inventory:low_stock", (data) => {
      if (socket.userRole === "seller") {
        io.to(`seller:${socket.userId}`).emit(
          "inventory:alert",
          {
            productId: data.productId,
            currentStock: data.stock,
            message: `Low stock alert for ${data.productName}`,
          }
        );
      }
    });

    // =============== PAYMENT EVENTS ===============
    socket.on("payment:initiated", (data) => {
      io.to(`user:${socket.userId}`).emit("payment:waiting", {
        orderId: data.orderId,
        amount: data.amount,
      });
    });

    socket.on("payment:confirmed", (data) => {
      io.to(`user:${data.userId}`).emit("payment:success", {
        orderId: data.orderId,
        amount: data.amount,
        transactionId: data.transactionId,
      });

      // Also notify relevant sellers/admin
      io.to(`role:admin`).emit("payment:confirmed", {
        orderId: data.orderId,
        userId: data.userId,
      });
    });

    socket.on("payment:failed", (data) => {
      io.to(`user:${socket.userId}`).emit("payment:failed", {
        orderId: data.orderId,
        reason: data.reason,
      });
    });

    // =============== AI CHAT EVENTS ===============
    socket.on("ai:typing", () => {
      socket.broadcast.emit("ai:thinking");
    });

    socket.on("ai:response", (data) => {
      io.to(`user:${socket.userId}`).emit("ai:message", data);
    });

    // =============== LIVE UPDATES ===============
    socket.on("product:view", (productId) => {
      io.emit("product:viewed", {
        productId,
        viewCount: 1,
        timestamp: new Date(),
      });
    });

    socket.on("wishlist:add", (data) => {
      io.emit("wishlist:updated", {
        productId: data.productId,
        userId: socket.userId,
      });
    });

    // =============== ADMIN EVENTS ===============
    if (socket.userRole === "admin") {
      socket.on("admin:broadcast", (data) => {
        io.emit("admin:announcement", {
          message: data.message,
          type: data.type,
          timestamp: new Date(),
        });
      });

      socket.on("admin:updateSettings", (data) => {
        io.emit("admin:settings_updated", data);
      });
    }

    // =============== DISCONNECT EVENT ===============
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};
