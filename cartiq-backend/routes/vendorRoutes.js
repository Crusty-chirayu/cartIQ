// c:\Users\chira\cartIQ\cartiq-backend\routes\vendorRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  submitKYC,
  getAnalytics,
  getAnalyticsChart,
  getPayouts,
  requestPayout,
} = require("../controllers/sellerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("seller", "admin"));

// Seller profile routes
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// KYC routes
router.post("/kyc", submitKYC);

// Analytics routes
router.get("/analytics", getAnalytics);
router.get("/analytics/chart", getAnalyticsChart);

// Payout routes
router.get("/payouts", getPayouts);
router.post("/payouts/request", requestPayout);

module.exports = router;
