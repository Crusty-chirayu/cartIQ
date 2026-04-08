const asyncHandler = require("express-async-handler");

let wishlist = [];

// GET WISHLIST
const getWishlist = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: wishlist,
  });
});

// ADD TO WISHLIST
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
  }

  res.json({
    success: true,
    message: "Added to wishlist",
    data: wishlist,
  });
});

// REMOVE FROM WISHLIST
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  wishlist = wishlist.filter((id) => id !== productId);

  res.json({
    success: true,
    message: "Removed from wishlist",
    data: wishlist,
  });
});

// TOGGLE WISHLIST
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
    return res.json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist,
    });
  }

  wishlist.push(productId);

  res.json({
    success: true,
    message: "Added to wishlist",
    data: wishlist,
  });
});

// ✅ EXPORTS
module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
};