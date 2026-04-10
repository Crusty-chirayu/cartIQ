// c:\Users\chira\cartIQ\cartiq-backend\controllers\vendorStatsController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse } = require("../utils/apiResponse");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");

/**
 * GET /api/vendor/stats
 * Get seller dashboard statistics
 */
const getVendorStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // Get total products
  const totalProducts = await Product.countDocuments({ seller: sellerId });

  // Get total sales (sum of order totals from seller's products)
  const salesData = await Order.aggregate([
    {
      $match: { status: "completed" }
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "orderId",
        as: "items"
      }
    },
    {
      $unwind: "$items"
    },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $match: {
        "product.seller": sellerId
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$items.price" }
      }
    }
  ]);

  const totalSales = salesData[0]?.totalSales || 0;

  // Get total orders
  const totalOrders = await Order.countDocuments({
    "items.sellerId": sellerId
  });

  // Get average rating
  const ratingData = await Review.aggregate([
    {
      $match: { seller: sellerId }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  const avgRating = ratingData[0]?.avgRating || 0;

  res.json(
    successResponse(
      {
        totalProducts,
        totalSales: Math.round(totalSales),
        totalOrders,
        avgRating: avgRating.toFixed(1)
      },
      "Stats fetched"
    )
  );
});

module.exports = { getVendorStats };
