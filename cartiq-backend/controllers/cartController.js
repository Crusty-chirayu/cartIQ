// c:\Users\chira\cartIQ\cartiq-backend\controllers\cartController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse } = require("../utils/apiResponse");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

/**
 * GET /api/cart
 * Get user's cart
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: "items",
      populate: { path: "product seller" },
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Cart returned with populated items
  // Totals calculated by frontend or via Cart model virtuals

  res.json(successResponse(cart));
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity, variant } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: "Product and quantity required" });
  }

  const product = await Product.findById(productId);
  if (!product || product.stock < quantity) {
    return res.status(400).json({ success: false, message: "Product unavailable" });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  // Check if item already in cart
  const existingItem = await CartItem.findOne({
    cart: cart._id,
    product: productId,
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    await existingItem.save();
  } else {
    const newItem = await CartItem.create({
      cart: cart._id,
      product: productId,
      variant,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      seller: product.seller,
    });

    cart.items.push(newItem._id);
  }

  await cart.save();

  // Re-populate items for response
  await cart.populate({
    path: "items",
    populate: { path: "product seller" },
  });

  res.json(successResponse(cart, "Item added", 201));
});

/**
 * PATCH /api/cart/items/:itemId
 * Update cart item
 */
const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: "Invalid quantity" });
  }

  const item = await CartItem.findById(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  const product = await Product.findById(item.product);
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: "Insufficient stock" });
  }

  item.quantity = quantity;
  item.totalPrice = item.unitPrice * quantity;
  await item.save();

  const cart = await Cart.findById(item.cart);
  updateCartTotals(cart);
  await cart.save();

  res.json(successResponse(cart));
});

/**
 * DELETE /api/cart/items/:itemId
 * Remove item from cart
 */
const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await CartItem.findById(itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  await CartItem.findByIdAndDelete(itemId);

  const cart = await Cart.findByIdAndUpdate(
    item.cart,
    { $pull: { items: itemId } },
    { new: true }
  );

  updateCartTotals(cart);
  await cart.save();

  res.json(successResponse(cart));
});

/**
 * DELETE /api/cart
 * Clear cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    await CartItem.deleteMany({ cart: cart._id });
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    await cart.save();
  }

  res.json(successResponse(null, "Cart cleared"));
});

/**
 * POST /api/cart/validate
 * Validate cart items are in stock
 */
const validateCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items",
    populate: { path: "product" },
  });

  if (!cart || cart.items.length === 0) {
    return res.json(successResponse({ valid: true }, "Cart is empty"));
  }

  let valid = true;
  for (const item of cart.items) {
    if (!item.product || item.product.stock < item.quantity) {
      valid = false;
      break;
    }
  }

  res.json(successResponse({ valid }, valid ? "Cart is valid" : "Some items are out of stock"));
});

/**
 * GET /api/cart/suggestions
 * Get AI-powered crosssell suggestions
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items",
    populate: { path: "product" },
  });

  if (!cart || cart.items.length === 0) {
    return res.json(successResponse([], "No suggestions for empty cart"));
  }

  // Get products from same categories
  const categories = [...new Set(cart.items.map(i => i.product?.category))].filter(Boolean);
  
  const suggestions = await Product.find({
    category: { $in: categories },
    _id: { $nin: cart.items.map(i => i.product?._id) },
  })
    .limit(5)
    .lean();

  res.json(successResponse(suggestions, "Crosssell suggestions"));
});

/**
 * Helper: Recalculate cart totals
 */
function updateCartTotals(cart) {
  const subtotal = cart.items.reduce((sum, itemId) => {
    // Note: items would need to be populated to calculate this properly
    return sum;
  }, 0);

  cart.shipping = 99;
  cart.tax = Math.round(subtotal * 0.18);
  cart.total = subtotal + cart.shipping + cart.tax;
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  validateCart,
  getSuggestions,
};
