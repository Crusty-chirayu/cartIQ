const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewSummary,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.get("/products/:productId", getReviews);
router.get("/products/:productId/summary", getReviewSummary);

router.post("/products/:productId", protect, createReview);
router.patch("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;