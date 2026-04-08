// c:\Users\chira\cartIQ\cartiq-backend\services\searchService.js
const Product = require("../models/Product");
const SearchLog = require("../models/SearchLog");
const { getPagination } = require("../utils/pagination");

/**
 * Search products with filters and pagination
 */
const searchProducts = async (searchQuery, filters = {}, paginationParams = {}) => {
  try {
    const { skip, limit } = getPagination(paginationParams);

    // Build MongoDB query
    const query = {
      status: "active",
      stock: { $gt: 0 },
    };

    // Text search
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    // Price range
    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = filters.priceMin;
      if (filters.priceMax) query.price.$lte = filters.priceMax;
    }

    // Category
    if (filters.category) {
      query.category = filters.category;
    }

    // Rating
    if (filters.minRating) {
      query["ratings.average"] = { $gte: filters.minRating };
    }

    // Seller
    if (filters.seller) {
      query.seller = filters.seller;
    }

    // Sort
    let sortQuery = {};
    if (filters.sortBy === "price_asc") sortQuery = { price: 1 };
    else if (filters.sortBy === "price_desc") sortQuery = { price: -1 };
    else if (filters.sortBy === "rating_desc") sortQuery = { "ratings.average": -1 };
    else if (filters.sortBy === "newest") sortQuery = { createdAt: -1 };
    else if (filters.sortBy === "trending") sortQuery = { views: -1, sales: -1 };
    else sortQuery = { _id: -1 };

    // Execute query
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("seller", "name avatar")
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    return {
      products,
      total,
      hasMore: skip + limit < total,
    };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

/**
 * Log search query
 */
const logSearch = async (userId, query, filters, resultsCount, clickedProductId = null) => {
  try {
    await SearchLog.create({
      user: userId || null,
      query,
      filters,
      resultsCount,
      resultClicked: clickedProductId || null,
      source: "search_bar",
    });
  } catch (error) {
    console.error("Log Search Error:", error);
  }
};

/**
 * Get trending searches
 */
const getTrendingSearches = async (limit = 10) => {
  try {
    return await SearchLog.aggregate([
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 },
          avgResults: { $avg: "$resultsCount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  } catch (error) {
    console.error("Get Trending Searches Error:", error);
    return [];
  }
};

/**
 * Advanced search with aggregation pipeline
 */
const advancedSearch = async (searchParams) => {
  try {
    const { query, filters, page = 1, limit = 20 } = searchParams;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          status: "active",
          stock: { $gt: 0 },
        },
      },
    ];

    // Text search
    if (query) {
      pipeline.push({
        $match: {
          $text: { $search: query },
        },
      });

      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" },
        },
      });
    }

    // Price range
    if (filters?.priceMin || filters?.priceMax) {
      const priceMatch = {};
      if (filters.priceMin) priceMatch.$gte = filters.priceMin;
      if (filters.priceMax) priceMatch.$lte = filters.priceMax;
      pipeline.push({ $match: { price: priceMatch } });
    }

    // Category
    if (filters?.category) {
      pipeline.push({ $match: { category: filters.category } });
    }

    // Lookup seller
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "seller",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$seller",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Sort
    if (query) {
      pipeline.push({ $sort: { score: -1 } });
    } else if (filters?.sortBy === "price_asc") {
      pipeline.push({ $sort: { price: 1 } });
    } else if (filters?.sortBy === "price_desc") {
      pipeline.push({ $sort: { price: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Facets for advanced filtering
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const result = await Product.aggregate(pipeline);

    return {
      products: result[0]?.data || [],
      total: result[0]?.metadata[0]?.total || 0,
      page,
      limit,
      hasMore: (page - 1) * limit + (result[0]?.data?.length || 0) < (result[0]?.metadata[0]?.total || 0),
    };
  } catch (error) {
    console.error("Advanced Search Error:", error);
    throw error;
  }
};

module.exports = {
  searchProducts,
  logSearch,
  getTrendingSearches,
  advancedSearch,
};
