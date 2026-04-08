// c:\Users\chira\cartIQ\cartiq-backend\controllers\productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const { slugify } = require("../utils/slugify");
const { searchProducts, logSearch } = require("../services/searchService");
const { getSimilarProducts } = require("../services/recommendationService");

/**
 * Get all products with filters
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, minPrice, maxPrice, sortBy, search } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = { status: "active", stock: { $gt: 0 } };

  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  let sortQuery = { createdAt: -1 };
  if (sortBy === "price_asc") sortQuery = { price: 1 };
  else if (sortBy === "price_desc") sortQuery = { price: -1 };
  else if (sortBy === "rating") sortQuery = { "ratings.average": -1 };
  else if (sortBy === "newest") sortQuery = { createdAt: -1 };

  const products = await Product.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate("seller", "name avatar")
    .populate("category", "name");

  const total = await Product.countDocuments(query);

  res.json(paginatedResponse(products, page, limit, total));
});

/**
 * Get product by slug
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, status: "active" })
    .populate("seller", "name avatar storeLogo")
    .populate("category")
    .exec();

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Increment views
  product.views += 1;
  await product.save();

  res.json(successResponse(product));
});

/**
 * Create product (seller/admin)
 */
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, images, stock, ...rest } = req.body;

  const product = await Product.create({
    title,
    slug: slugify(title),
    description,
    price,
    category,
    images,
    stock,
    seller: req.user._id,
    status: req.user.role === "admin" ? "active" : "draft",
    ...rest,
  });

  res.status(201).json(successResponse(product, "Product created", 201));
});

/**
 * Update product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  Object.assign(product, req.body);
  await product.save();

  res.json(successResponse(product, "Product updated"));
});

/**
 * Delete product
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  product.status = "deleted";
  await product.save();

  res.json(successResponse(null, "Product deleted"));
});

/**
 * Get featured products
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, status: "active", stock: { $gt: 0 } })
    .limit(12)
    .populate("seller");

  res.json(successResponse(products));
});

/**
 * Get trending products
 */
const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "active", stock: { $gt: 0 } })
    .sort({ views: -1, sales: -1 })
    .limit(12);

  res.json(successResponse(products));
});

/**
 * Search products
 */
const searchProductsCtrl = asyncHandler(async (req, res) => {
  const { query, category, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = req.query;

  const result = await searchProducts(
    query,
    { category, minPrice: parseInt(minPrice) || 0, maxPrice: parseInt(maxPrice) || 1000000, sortBy },
    { page, limit }
  );

  // Log search
  logSearch(req.user?._id, query, {}, result.products.length);

  const total = result.total;
  res.json(paginatedResponse(result.products, page, limit, total));
});

/**
 * Get similar products
 */
const getSimilar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const similar = await getSimilarProducts(id, 8);

  res.json(successResponse(similar));
});

module.exports = {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getTrendingProducts,
  searchProductsCtrl,
  getSimilar,
};
