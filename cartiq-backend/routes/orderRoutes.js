// c:\Users\chira\cartIQ\cartiq-backend\routes\orderRoutes.js
const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrder,
  cancelOrderCtrl,
  updateStatus,
  getSellerOrdersCtrl,
  trackOrder,
  getStats,
} = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Customer routes
router.post("/", protect, placeOrder);
router.get("/", protect, getOrders);
router.get("/stats", protect, getStats);
router.get("/:id", protect, getOrder);
router.get("/:id/track", protect, trackOrder);
router.patch("/:id/cancel", protect, cancelOrderCtrl);

// Seller routes
router.get("/seller/incoming", protect, authorizeRoles("seller", "admin"), getSellerOrdersCtrl);
router.patch("/:id/status", protect, authorizeRoles("seller", "admin"), updateStatus);

module.exports = router;