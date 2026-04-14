// c:\Users\chira\cartIQ\cartiq-backend\controllers\productController.js

const Product = require("../models/Product");
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const { slugify } = require("../utils/slugify");

/**
 * Get all products with filters
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    sort,
    search,
  } = req.query;

  const { skip } = getPagination({ page, limit });

  // ✅ FIX: remove strict status filter
  const query = {
    stock: { $gt: 0 },
  };

  if (category) query.category = category;

  // ✅ FIX: proper price filtering (always applied correctly)
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice !== undefined)
      query.price.$gte = parseInt(minPrice) || 0;
    if (maxPrice !== undefined)
      query.price.$lte = parseInt(maxPrice) || 1000000;
  }

  // ✅ FIX: search
  if (search) {
    query.$text = { $search: search };
  }

  // ✅ FIX: match frontend sort values
  let sortQuery = { createdAt: -1 };

  if (sort === "price-low-high") sortQuery = { price: 1 };
  else if (sort === "price-high-low") sortQuery = { price: -1 };
  else if (sort === "rating") sortQuery = { "ratings.average": -1 };
  else if (sort === "newest") sortQuery = { createdAt: -1 };

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

  const product = await Product.findOne({ slug })
    .populate("seller", "name avatar storeLogo")
    .populate("category")
    .exec();

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  product.views = (product.views || 0) + 1;
  await product.save();

  res.json(successResponse(product));
});

/**
 * Create product
 */
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, images, stock } = req.body;

  const product = await Product.create({
    title,
    slug: slugify(title),
    description,
    price,
    category,
    images,
    stock,
    seller: req.user?._id,
    status: "active", // ✅ FIX: always active
  });

  res.status(201).json(successResponse(product, "Product created"));
});

/**
 * Update product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
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
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  await product.deleteOne();

  res.json(successResponse(null, "Product deleted"));
});

module.exports = {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};