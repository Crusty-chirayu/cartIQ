const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get user's wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("products", "title slug price images ratings stock");

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.json(successResponse(wishlist));
});

/**
 * Add product to wishlist
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json(errorResponse("Product ID required", 400));
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json(errorResponse("Product not found", 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
  } else {
    // Check if product already in wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
  }

  await wishlist.populate("products", "title slug price images ratings stock");

  res.json(successResponse(wishlist, "Added to wishlist", 201));
});

/**
 * Remove product from wishlist
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json(errorResponse("Product ID required", 400));
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.status(404).json(errorResponse("Wishlist not found", 404));
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();
  await wishlist.populate("products", "title slug price images ratings stock");

  res.json(successResponse(wishlist, "Removed from wishlist"));
});

/**
 * Toggle wishlist (add if not present, remove if present)
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json(errorResponse("Product ID required", 400));
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json(errorResponse("Product not found", 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });
    await wishlist.populate("products", "title slug price images ratings stock");
    return res.json(successResponse(wishlist, "Added to wishlist", 201));
  }

  const productInWishlist = wishlist.products.some(
    (id) => id.toString() === productId
  );

  if (productInWishlist) {
    // Remove from wishlist
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();
    await wishlist.populate("products", "title slug price images ratings stock");
    return res.json(successResponse(wishlist, "Removed from wishlist"));
  }

  // Add to wishlist
  wishlist.products.push(productId);
  await wishlist.save();
  await wishlist.populate("products", "title slug price images ratings stock");

  res.json(successResponse(wishlist, "Added to wishlist", 201));
});

/**
 * Clear wishlist
 */
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return res.status(404).json(errorResponse("Wishlist not found", 404));
  }

  wishlist.products = [];
  await wishlist.save();

  res.json(successResponse(wishlist, "Wishlist cleared"));
});

/**
 * Check if product is in wishlist
 */
const isInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json(errorResponse("Product ID required", 400));
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  const inWishlist = wishlist
    ? wishlist.products.some(id => id.toString() === productId)
    : false;

  res.json(successResponse({ inWishlist, productId }));
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  isInWishlist,
};