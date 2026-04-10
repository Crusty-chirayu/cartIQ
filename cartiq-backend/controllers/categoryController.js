// c:\Users\chira\cartIQ\cartiq-backend\controllers\categoryController.js
const Category = require("../models/Category");
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");

/**
 * Get all categories
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, parent } = req.query;
  const { skip } = getPagination({ page, limit });

  const query = { isActive: true };
  if (parent) {
    query.parent = parent === "null" ? null : parent;
  }

  const categories = await Category.find(query)
    .populate("parent", "name slug")
    .sort({ displayOrder: 1, name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  res.json(paginatedResponse(categories, page, limit, total, "Categories fetched"));
});

/**
 * Get category by slug
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true })
    .populate("parent", "name slug");

  if (!category) {
    return res.status(404).json(errorResponse("Category not found"));
  }

  // Get subcategories
  const subcategories = await Category.find({ parent: category._id, isActive: true })
    .sort({ displayOrder: 1, name: 1 });

  res.json(
    successResponse(
      { ...category.toObject(), subcategories },
      "Category fetched"
    )
  );
});

/**
 * Get root categories (no parent)
 */
const getRootCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null, isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .limit(50);

  res.json(successResponse(categories, "Root categories fetched"));
});

/**
 * Get subcategories by parent
 */
const getSubcategories = asyncHandler(async (req, res) => {
  const { parentId } = req.params;

  const categories = await Category.find({ parent: parentId, isActive: true })
    .sort({ displayOrder: 1, name: 1 });

  res.json(successResponse(categories, "Subcategories fetched"));
});

/**
 * Create category (admin only)
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, image, parent, displayOrder, seo } = req.body;

  const category = await Category.create({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description,
    icon,
    image,
    parent,
    displayOrder,
    seo,
  });

  res.status(201).json(successResponse(category, "Category created"));
});

/**
 * Update category (admin only)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, icon, image, parent, displayOrder, isActive, seo } = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    {
      name: name || undefined,
      description: description || undefined,
      icon: icon || undefined,
      image: image || undefined,
      parent: parent !== undefined ? parent : undefined,
      displayOrder: displayOrder !== undefined ? displayOrder : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      seo: seo || undefined,
    },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json(errorResponse("Category not found"));
  }

  res.json(successResponse(category, "Category updated"));
});

/**
 * Delete category (admin only)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category has subcategories
  const hasSubcategories = await Category.exists({ parent: id });
  if (hasSubcategories) {
    return res
      .status(400)
      .json(errorResponse("Cannot delete category with subcategories"));
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return res.status(404).json(errorResponse("Category not found"));
  }

  res.json(successResponse(null, "Category deleted"));
});

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getRootCategories,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
