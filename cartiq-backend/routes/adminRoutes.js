// c:\Users\chira\cartIQ\cartiq-backend\routes\adminRoutes.js

const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  banUser,
  getAllSellers,
  getKYCRequests, // ✅ FIXED: added missing import
  approveKYC,
  rejectKYC,
  getAllProducts,
  verifyProduct,
  getPlatformAnalytics,
} = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Protect all admin routes
router.use(protect, authorizeRoles("admin"));

// ================= USER MANAGEMENT =================
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", banUser);

// ================= SELLER MANAGEMENT =================
router.get("/sellers", getAllSellers);
router.get("/kyc", getKYCRequests); // ✅ now works
router.patch("/kyc/:id/approve", approveKYC);
router.patch("/kyc/:id/reject", rejectKYC);

// ================= PRODUCT MODERATION =================
router.get("/products", getAllProducts);
router.patch("/products/:id/verify", verifyProduct);

// ================= ANALYTICS =================
router.get("/analytics", getPlatformAnalytics);

module.exports = router;