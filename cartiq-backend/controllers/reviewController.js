const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Create a review for a purchased product
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, title, comment, images } = req.body;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json(errorResponse("Rating must be between 1 and 5", 400));
  }

  // Verify order belongs to user and product is in order
  const order = await Order.findById(orderId);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(errorResponse("Order not found or not authorized", 403));
  }

  const itemInOrder = order.items.some(item => item.product.toString() === productId);
  if (!itemInOrder) {
    return res.status(400).json(errorResponse("Product not in this order", 400));
  }

  // Check if user already reviewed this product from this order
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: orderId,
  });

  if (existingReview) {
    return res.status(400).json(errorResponse("You have already reviewed this product", 400));
  }

  // Create review
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating,
    title,
    comment,
    images: images || [],
  });

  // Update product ratings
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Product.findByIdAndUpdate(productId, {
    "ratings.average": parseFloat(avgRating.toFixed(2)),
    "ratings.count": allReviews.length,
  });

  await review.populate("user", "name avatar");

  res.status(201).json(
    successResponse(review, "Review created successfully", 201)
  );
});

/**
 * Get reviews for a product
 */
const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ product: productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ product: productId });

  res.json(
    successResponse({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  );
});

/**
 * Update a review
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, images } = req.body;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json(errorResponse("Review not found", 404));
  }

  // Verify user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(errorResponse("Not authorized to update this review", 403));
  }

  // Update review
  review.rating = rating !== undefined ? rating : review.rating;
  review.title = title !== undefined ? title : review.title;
  review.comment = comment !== undefined ? comment : review.comment;
  review.images = images !== undefined ? images : review.images;

  await review.save();

  // Recalculate product ratings
  const allReviews = await Review.find({ product: review.product });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Product.findByIdAndUpdate(review.product, {
    "ratings.average": parseFloat(avgRating.toFixed(2)),
    "ratings.count": allReviews.length,
  });

  await review.populate("user", "name avatar");

  res.json(successResponse(review, "Review updated successfully"));
});

/**
 * Delete a review
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return res.status(404).json(errorResponse("Review not found", 404));
  }

  // Verify user owns the review
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json(errorResponse("Not authorized to delete this review", 403));
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  // Recalculate product ratings
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;

  await Product.findByIdAndUpdate(productId, {
    "ratings.average": allReviews.length > 0 ? parseFloat(avgRating.toFixed(2)) : 0,
    "ratings.count": allReviews.length,
  });

  res.json(successResponse(null, "Review deleted successfully"));
});

/**
 * Get review summary for product
 */
const getReviewSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId });
  const total = reviews.length;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const average = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  res.json(
    successResponse({
      totalReviews: total,
      averageRating: parseFloat(average.toFixed(2)),
      ratingDistribution,
      verifiedReviews: reviews.filter(r => r.verified).length,
    })
  );
});

/**
 * Mark review as helpful
 */
const markHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndUpdate(
    id,
    { $inc: { helpful: 1 } },
    { new: true }
  );

  if (!review) {
    return res.status(404).json(errorResponse("Review not found", 404));
  }

  res.json(successResponse(review, "Marked as helpful"));
});

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewSummary,
  markHelpful,
};