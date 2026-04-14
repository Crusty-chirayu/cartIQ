// c:\Users\chira\cartIQ\cartiq-backend\routes\productRoutes.js

const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// ================== PUBLIC ROUTES ==================
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

// ================== PROTECTED ROUTES ==================
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;