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
  getKYCStatus,
} = require("../controllers/sellerController");
const { getVendorStats } = require("../controllers/vendorStatsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("seller", "admin"));

// Stats route
router.get("/stats", getVendorStats);

// Seller profile routes
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

// KYC routes
router.get("/kyc-status", getKYCStatus);
router.post("/kyc", submitKYC);

// Analytics routes
router.get("/analytics", getAnalytics);
router.get("/analytics/chart", getAnalyticsChart);

// Payout routes
router.get("/payouts", getPayouts);
router.post("/payouts/request", requestPayout);

module.exports = router;
