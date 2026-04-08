// c:\Users\chira\cartIQ\cartiq-backend\services/recommendationService.js
const Product = require("../models/Product");
const Order = require("../models/Order");
const ProductView = require("../models/ProductView");
const RecentlyViewed = require("../models/RecentlyViewed");

/**
 * Get personalized recommendations for user
 */
const getPersonalizedRecommendations = async (userId, limit = 12) => {
  try {
    // Get user's recently viewed products
    const recentlyViewed = await RecentlyViewed.findOne({ user: userId }).populate("products.product");

    if (!recentlyViewed || recentlyViewed.products.length === 0) {
      return getTrendingProducts(limit);
    }

    // Get categories from recently viewed
    const categoryIds = recentlyViewed.products
      .slice(0, 3)
      .map((item) => item.product?.category)
      .filter(Boolean);

    // Find similar products
    const recommendations = await Product.find({
      status: "active",
      stock: { $gt: 0 },
      category: { $in: categoryIds },
      _id: { $nin: recentlyViewed.products.map((item) => item.product?._id) },
    })
      .sort({ "ratings.average": -1, sales: -1 })
      .limit(limit)
      .lean();

    return recommendations;
  } catch (error) {
    console.error("Recommendation Error:", error);
    return getTrendingProducts(limit);
  }
};

/**
 * Get trending products
 */
const getTrendingProducts = async (limit = 12) => {
  return await Product.find({ status: "active", stock: { $gt: 0 } })
    .sort({ views: -1, sales: -1, "ratings.average": -1 })
    .limit(limit)
    .lean();
};

/**
 * Get similar products by category and price
 */
const getSimilarProducts = async (productId, limit = 8) => {
  try {
    const product = await Product.findById(productId).lean();
    if (!product) return [];

    const similar = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      status: "active",
      stock: { $gt: 0 },
      price: {
        $gte: product.price * 0.7,
        $lte: product.price * 1.3,
      },
    })
      .sort({ "ratings.average": -1 })
      .limit(limit)
      .lean();

    return similar;
  } catch (error) {
    console.error("Similar Products Error:", error);
    return [];
  }
};

/**
 * Get cross-sell recommendations (products that go well together)
 */
const getCrossSellRecommendations = async (productIds, limit = 5) => {
  try {
    // Find products frequently bought together
    const orders = await Order.find({
      "items.product": { $in: productIds },
    })
      .select("items.product")
      .lean();

    // Count co-occurrences
    const productCounts = {};
    orders.forEach((order) => {
      const products = order.items.map((item) => item.product.toString());
      products.forEach((p) => {
        productIds.forEach((pid) => {
          if (p !== pid.toString()) {
            productCounts[p] = (productCounts[p] || 0) + 1;
          }
        });
      });
    });

    // Get top products
    const topProductIds = Object.keys(productCounts)
      .sort((a, b) => productCounts[b] - productCounts[a])
      .slice(0, limit);

    const recommendations = await Product.find({
      _id: { $in: topProductIds },
      status: "active",
      stock: { $gt: 0 },
    }).lean();

    return recommendations;
  } catch (error) {
    console.error("Cross-sell Error:", error);
    return [];
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getTrendingProducts,
  getSimilarProducts,
  getCrossSellRecommendations,
};
