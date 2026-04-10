// c:\Users\chira\cartIQ\cartiq-backend\routes\adminRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  banUser,
  getAllSellers,
  approveKYC,
  rejectKYC,
  getAllProducts,
  verifyProduct,
  getPlatformAnalytics,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect, authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", banUser);

// Seller management
router.get("/sellers", getAllSellers);
router.get("/kyc", getKYCRequests);
router.patch("/kyc/:id/approve", approveKYC);
router.patch("/kyc/:id/reject", rejectKYC);

// Product moderation
router.get("/products", getAllProducts);
router.patch("/products/:id/verify", verifyProduct);

// Analytics
router.get("/analytics", getPlatformAnalytics);

module.exports = router;
