// c:\Users\chira\cartIQ\cartiq-backend\routes\aiRoutes.js
const express = require("express");
const router = express.Router();
const {
  chat,
  getConversationHistory,
  clearConversation,
  generateDescription,
  generateTags,
  recommend,
  searchSemantic,
  suggestPricing,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Chat endpoints
router.post("/chat", chat);
router.get("/conversations/:id", getConversationHistory);
router.delete("/conversations/:id", clearConversation);

// AI generation endpoints
router.post("/generate/description", generateDescription);
router.post("/generate/tags", generateTags);

// Recommendations
router.get("/recommend", recommend);

// Search
router.post("/search/semantic", searchSemantic);

// Pricing suggestions (seller only)
router.post("/pricing/suggest", suggestPricing);

module.exports = router;