// c:\Users\chira\cartIQ\cartiq-backend\routes\cartRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  validateCart,
  getSuggestions,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);
router.delete("/", clearCart);
router.post("/validate", validateCart);
router.get("/suggestions", getSuggestions);

module.exports = router;
