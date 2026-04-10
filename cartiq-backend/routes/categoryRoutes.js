// c:\Users\chira\cartIQ\cartiq-backend\routes\categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
  getRootCategories,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllCategories);
router.get("/root", getRootCategories);
router.get("/:slug", getCategoryBySlug);
router.get("/:parentId/subcategories", getSubcategories);

// Protected routes (admin only)
router.post("/", protect, authorizeRoles("admin"), createCategory);
router.patch("/:id", protect, authorizeRoles("admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

module.exports = router;
