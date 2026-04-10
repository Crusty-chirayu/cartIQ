// c:\Users\chira\cartIQ\cartiq-backend\controllers\sellerController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse } = require("../utils/apiResponse");
const User = require("../models/User");
const VendorProfile = require("../models/VendorProfile");
const KYC = require("../models/KYC");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payout = require("../models/Payout");

/**
 * POST /api/vendor/register
 */
const registerVendor = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, category, address } = req.body;

  // Create vendor profile
  const vendor = await VendorProfile.create({
    seller: req.user._id,
    storeName,
    storeDescription,
    categories: [category],
    address,
  });

  // Create KYC record
  await KYC.create({
    seller: req.user._id,
    businessName: storeName,
  });

  // Update user role
  req.user.role = "seller";
  await req.user.save();

  res.status(201).json(successResponse(vendor, "Vendor registered", 201));
});

/**
 * GET /api/vendor/profile
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await VendorProfile.findOne({ seller: req.user._id }).populate("categories");

  if (!vendor) {
    return res.status(404).json({ success: false, message: "Vendor profile not found" });
  }

  res.json(successResponse(vendor));
});

/**
 * PATCH /api/vendor/profile
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, storeLogo, socialLinks, returnPolicy } = req.body;

  const vendor = await VendorProfile.findOneAndUpdate(
    { seller: req.user._id },
    { storeName, storeDescription, storeLogo, socialLinks, returnPolicy },
    { new: true }
  );

  res.json(successResponse(vendor, "Profile updated"));
});

/**
 * POST /api/vendor/kyc
 */
const submitKYC = asyncHandler(async (req, res) => {
  const { businessType, panNumber, gstNumber, bankAccount, documents } = req.body;

  const kyc = await KYC.findOneAndUpdate(
    { seller: req.user._id },
    {
      businessType,
      panNumber,
      gstNumber,
      bankAccount,
      documents,
      status: "pending",
      submittedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  res.json(successResponse(kyc, "KYC submitted"));
});

/**
 * GET /api/vendor/analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const seller = req.user._id;

  // Calculate revenue
  const orders = await Order.find({ "items.seller": seller });
  const totalRevenue = orders.reduce((sum, order) => {
    const sellerItems = order.items.filter((item) => item.seller.toString() === seller.toString());
    return sum + sellerItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
  }, 0);

  const totalOrders = orders.length;

  // Get top products
  const topProducts = await Product.find({ seller }).sort({ sales: -1 }).limit(5);

  // Calculate ratings
  const reviews = await Product.aggregate([
    { $match: { seller } },
    { $group: { _id: null, avgRating: { $avg: "$ratings.average" } } },
  ]);

  res.json(
    successResponse({
      totalRevenue,
      totalOrders,
      topProducts,
      avgRating: reviews[0]?.avgRating || 0,
      totalProducts: await Product.countDocuments({ seller }),
    })
  );
});

/**
 * GET /api/vendor/analytics/chart
 * Get chart data for analytics dashboard
 */
const getAnalyticsChart = asyncHandler(async (req, res) => {
  const seller = req.user._id;
  const { period = "monthly" } = req.query;

  // Get orders for the period
  let dateFilter = {};
  const now = new Date();

  if (period === "weekly") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: sevenDaysAgo } };
  } else if (period === "monthly") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
  }

  const orders = await Order.find({
    ...dateFilter,
    "items.seller": seller,
  });

  // Calculate daily revenue
  const chartData = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    const revenue = order.items
      .filter((item) => item.seller.toString() === seller.toString())
      .reduce((sum, item) => sum + item.totalPrice, 0);

    chartData[date] = (chartData[date] || 0) + revenue;
  });

  // Convert to array for charting
  const data = Object.entries(chartData).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  res.json(successResponse(data, "Chart data fetched"));
});

/**
 * GET /api/vendor/payouts
 */
const getPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ seller: req.user._id }).sort({ createdAt: -1 });

  res.json(successResponse(payouts));
});

/**
 * POST /api/vendor/payouts/request
 */
const requestPayout = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const payout = await Payout.create({
    seller: req.user._id,
    payoutNumber: `PYT-${Date.now()}`,
    amount,
    status: "pending",
  });

  res.status(201).json(successResponse(payout, "Payout request created", 201));
});

/**
 * GET /api/vendor/products
 */
const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const query = { seller: req.user._id };
  if (status) query.status = status;

  const products = await Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/vendor/kyc-status
 */
const getKYCStatus = asyncHandler(async (req, res) => {
  const kyc = await KYC.findOne({ seller: req.user._id });

  if (!kyc) {
    return res.status(404).json({ success: false, message: "KYC not found" });
  }

  res.json(successResponse(kyc));
});

module.exports = {
  registerVendor,
  getProfile: getVendorProfile,        // Alias for route compatibility
  updateProfile: updateVendorProfile,   // Alias for route compatibility
  getVendorProfile,
  updateVendorProfile,
  submitKYC,
  getAnalytics,
  getAnalyticsChart,
  getPayouts,
  requestPayout,
  getSellerProducts,
  getKYCStatus,
};
