// c:\Users\chira\cartIQ\cartiq-backend\controllers\aiController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse } = require("../utils/apiResponse");
const {
  handleAIChat,
  generateProductDescription,
  generateProductTags,
  suggestPricing,
  getConversationHistory,
  clearConversation,
} = require("../services/aiService");
const { getRecommendations } = require("../services/recommendationService");
const ProductView = require("../models/ProductView");

/**
 * POST /api/ai/chat
 * Main AI chat endpoint
 */
const chat = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user._id;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message required" });
  }

  const response = await handleAIChat(userId, message, conversationId);

  res.json(successResponse(response));
});

/**
 * GET /api/ai/conversation/:id
 * Get conversation history
 */
const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const history = await getConversationHistory(id);

  res.json(successResponse(history));
});

/**
 * DELETE /api/ai/conversation/:id
 * Clear conversation
 */
const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await clearConversation(id);

  res.json(successResponse(null, "Conversation cleared"));
});

/**
 * POST /api/ai/generate/description
 * Generate product description
 */
const generateDescription = asyncHandler(async (req, res) => {
  const { title, category, attributes } = req.body;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: "Title and category required" });
  }

  const description = await generateProductDescription(title, category, attributes);

  res.json(successResponse(description));
});

/**
 * POST /api/ai/generate/tags
 * Generate product tags
 */
const generateTags = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: "Title and category required" });
  }

  const tags = await generateProductTags(title, description, category);

  res.json(successResponse(tags));
});

/**
 * POST /api/ai/pricing/suggest
 * Suggest pricing
 */
const suggestPrice = asyncHandler(async (req, res) => {
  const { productTitle, category, costPrice } = req.body;

  if (!productTitle || !category || !costPrice) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  const pricing = await suggestPricing(productTitle, category, costPrice);

  res.json(successResponse(pricing));
});

/**
 * POST /api/ai/recommend
 * Get personalized recommendations
 */
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 12 } = req.body;

  const recommendations = await getRecommendations(userId, limit);

  res.json(successResponse(recommendations));
});

/**
 * POST /api/ai/track-view
 * Track product view for analytics
 */
const trackProductView = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  await ProductView.create({
    product: productId,
    user: req.user?._id,
    viewDuration: 0,
  });

  res.json(successResponse(null, "View tracked"));
});

// Semantic search function for AI-powered product search
const searchSemantic = asyncHandler(async (req, res) => {
  const { query, filters = {} } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: "Search query required" });
  }

  // Use recommendation service for semantic search
  const results = await getRecommendations(req.user._id, 12);

  res.json(successResponse(results, "Search results"));
});

module.exports = {
  chat,
  getConversationHistory: getConversation,        // Alias for route compatibility
  clearConversation: deleteConversation,          // Alias for route compatibility
  generateDescription,
  generateTags,
  suggestPricing: suggestPrice,                   // Alias for route compatibility
  recommend: getPersonalizedRecommendations,      // Alias for route compatibility
  searchSemantic,
  // Original exports for backward compatibility
  getConversation,
  deleteConversation,
  suggestPrice,
  getPersonalizedRecommendations,
  trackProductView,
};
