// services/aiService.js

// Dummy AI service (safe fallback)

const generateResponse = async (message) => {
  return {
    reply: `AI response for: ${message}`,
  };
};

const analyzeCart = async (cart) => {
  return {
    suggestions: ["Try adding related products"],
  };
};

const clearConversation = async () => {
  return {
    message: "Conversation cleared",
  };
};

// ✅ EXPORT EVERYTHING PROPERLY
module.exports = {
  generateResponse,
  analyzeCart,
  clearConversation,
};