const asyncHandler = require("express-async-handler");

// Temporary in-memory storage (replace with DB later)
let reviews = [];

// CREATE REVIEW
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const newReview = {
    id: Date.now().toString(),
    productId,
    rating,
    comment,
  };

  reviews.push(newReview);

  res.status(201).json({
    success: true,
    message: "Review created",
    data: newReview,
  });
});

// GET REVIEWS FOR PRODUCT
const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const productReviews = reviews.filter(
    (review) => review.productId === productId
  );

  res.json({
    success: true,
    count: productReviews.length,
    data: productReviews,
  });
});

// UPDATE REVIEW
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = reviews.find((r) => r.id === id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  res.json({
    success: true,
    message: "Review updated",
    data: review,
  });
});

// DELETE REVIEW
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = reviews.find((r) => r.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Review not found" });
  }

  reviews = reviews.filter((r) => r.id !== id);

  res.json({
    success: true,
    message: "Review deleted",
  });
});

// REVIEW SUMMARY
const getReviewSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const productReviews = reviews.filter(
    (r) => r.productId === productId
  );

  const total = productReviews.length;

  const avg =
    total === 0
      ? 0
      : productReviews.reduce((acc, r) => acc + r.rating, 0) / total;

  res.json({
    success: true,
    totalReviews: total,
    averageRating: avg.toFixed(1),
  });
});

// ✅ EXPORTS (VERY IMPORTANT)
module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewSummary,
};