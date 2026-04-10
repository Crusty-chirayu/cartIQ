const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewSummary,
  markHelpful,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/products/:productId", getReviews);
router.get("/products/:productId/summary", getReviewSummary);

// Protected routes
router.post("/", protect, createReview);
router.patch("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.patch("/:id/helpful", markHelpful);

module.exports = router;