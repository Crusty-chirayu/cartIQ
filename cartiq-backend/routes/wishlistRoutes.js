const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  toggleWishlist,
  clearWishlist,
  isInWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// Protect all routes
router.use(protect);

router.get("/", getWishlist);
router.get("/check", isInWishlist);
router.post("/", addToWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/", removeFromWishlist);
router.delete("/clear", clearWishlist);

module.exports = router;