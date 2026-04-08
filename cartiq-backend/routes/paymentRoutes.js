// c:\Users\chira\cartIQ\cartiq-backend\routes\paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  getTransactions,
  handleWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Initiate and verify payments (protected)
router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);

// Transaction history (protected)
router.get("/transactions", protect, getTransactions);

// Webhook (public, signature verified inside)
router.post("/webhook/:provider", handleWebhook);

module.exports = router;
