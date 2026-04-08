// c:\Users\chira\cartIQ\cartiq-backend\controllers\adminController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const KYC = require("../models/KYC");
const { getPagination } = require("../utils/pagination");

/**
 * GET /api/admin/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isBanned } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {};
  if (role) query.role = role;
  if (isBanned !== undefined) query.isBanned = isBanned === "true";

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .select("-passwordHash");

  const total = await User.countDocuments(query);

  res.json(paginatedResponse(users, page, limit, total));
});

/**
 * PATCH /api/admin/users/:id/ban
 */
const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ban } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: ban },
    { new: true }
  );

  res.json(successResponse(user, ban ? "User banned" : "User unbanned"));
});

/**
 * GET /api/admin/sellers
 */
const getSellers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { skip } = getPagination({ page, limit });

  const sellers = await User.find({ role: "seller" })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ role: "seller" });

  res.json(paginatedResponse(sellers, page, limit, total));
});

/**
 * GET /api/admin/kyc
 */
const getKYCRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {};
  if (status) query.status = status;

  const kycs = await KYC.find(query)
    .skip(skip)
    .limit(limit)
    .populate("seller", "name email");

  const total = await KYC.countDocuments(query);

  res.json(paginatedResponse(kycs, page, limit, total));
});

/**
 * PATCH /api/admin/kyc/:id/approve
 */
const approveKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const kyc = await KYC.findByIdAndUpdate(
    id,
    {
      status: "verified",
      verifiedAt: new Date(),
      expiresAt: new Date(+new Date() + 365 * 24 * 60 * 60 * 1000),
    },
    { new: true }
  );

  res.json(successResponse(kyc, "KYC approved"));
});

/**
 * PATCH /api/admin/kyc/:id/reject
 */
const rejectKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const kyc = await KYC.findByIdAndUpdate(
    id,
    {
      status: "rejected",
      rejectionReason: reason,
    },
    { new: true }
  );

  res.json(successResponse(kyc, "KYC rejected"));
});

/**
 * GET /api/admin/products
 */
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = {};
  if (status) query.status = status;

  const products = await Product.find(query)
    .skip(skip)
    .limit(limit)
    .populate("seller", "name");

  const total = await Product.countDocuments(query);

  res.json(paginatedResponse(products, page, limit, total));
});

/**
 * PATCH /api/admin/products/:id/verify
 */
const verifyProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verify } = req.body;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      isVerified: verify,
      status: verify ? "active" : "draft",
    },
    { new: true }
  );

  res.json(successResponse(product, "Product status updated"));
});

/**
 * GET /api/admin/analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "customer" });
  const totalSellers = await User.countDocuments({ role: "seller" });
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments({ status: "active" });

  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.total" },
        avgOrderValue: { $avg: "$pricing.total" },
      },
    },
  ]);

  res.json(
    successResponse({
      totalUsers,
      totalSellers,
      totalOrders,
      totalProducts,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      avgOrderValue: orderStats[0]?.avgOrderValue || 0,
    })
  );
});

module.exports = {
  getAllUsers,
  banUser,
  getAllSellers: getSellers,                  // Alias for route compatibility
  getKYCRequests,
  approveKYC,
  rejectKYC,
  getAllProducts: getAllProductsAdmin,        // Alias for route compatibility
  verifyProduct,
  getPlatformAnalytics: getAnalytics,         // Alias for route compatibility
  // Original exports for backward compatibility
  getSellers,
  getAllProductsAdmin,
  getAnalytics,
};
