// c:\Users\chira\cartIQ\cartiq-backend\routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getTrendingProducts,
  searchProductsCtrl,
  getSimilar,
} = require("../controllers/productController");
const { protect, optionalAuth, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/trending", getTrendingProducts);
router.get("/search", searchProductsCtrl);
router.get("/:slug/similar", getSimilar);
router.get("/:slug", getProductBySlug);

// Protected routes (seller/admin)
router.post("/", protect, authorizeRoles("seller", "admin"), createProduct);
router.patch("/:id", protect, authorizeRoles("seller", "admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("seller", "admin"), deleteProduct);
router.post("/:id/images", protect, authorizeRoles("seller", "admin"), uploadProductImages, (req, res) => {
  res.json({ success: true, message: "Images uploaded", files: req.files });
});

module.exports = router;