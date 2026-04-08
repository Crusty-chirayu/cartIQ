// c:\Users\chira\cartIQ\cartiq-backend\services\intentService.js
/**
 * Intent detection service
 * Categorizes user messages into predefined intents
 */

const INTENT_TYPES = {
  GREETING: "greeting",
  BROWSING: "browsing",
  SEARCH: "search",
  REFINEMENT: "refinement",
  COMPARISON: "comparison",
  PRODUCT_DETAIL: "product_detail",
  ADD_TO_CART: "add_to_cart",
  ORDER_STATUS: "order_status",
  COMPLAINT: "complaint",
  SUPPORT_REQUEST: "support_request",
  OUT_OF_SCOPE: "out_of_scope",
};

/**
 * Detect intent from user message
 */
const detectIntent = (message, conversationHistory = []) => {
  const lowerMessage = message.toLowerCase().trim();

  // Greeting patterns
  if (/^(hi|hello|hey|greetings|hola|namaste)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.GREETING,
      confidence: 0.95,
      entities: {},
    };
  }

  // Search patterns
  if (/\b(find|search|looking for|show me|get me|give me|i want|find me|show)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.SEARCH,
      confidence: 0.9,
      entities: extractSearchEntities(lowerMessage),
    };
  }

  // Add to cart patterns
  if (/\b(add|buy|purchase|checkout|add to cart|get|order)\b/.test(lowerMessage) && /\b(this|that|it|this one|product)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.ADD_TO_CART,
      confidence: 0.85,
      entities: {},
    };
  }

  // Order status patterns
  if (/\b(track|status|where|my order|order number|deliver|shipped)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.ORDER_STATUS,
      confidence: 0.9,
      entities: extractOrderEntities(lowerMessage),
    };
  }

  // Complaint/Issue patterns
  if (/\b(problem|issue|complaint|broken|defective|damaged|wrong|bad|not working)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.COMPLAINT,
      confidence: 0.85,
      entities: {},
    };
  }

  // Support request patterns
  if (/\b(help|support|assist|need help|need assistance|contact|ticket|issue)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.SUPPORT_REQUEST,
      confidence: 0.8,
      entities: {},
    };
  }

  // Refinement patterns (assuming previous search intent)
  const lastIntent = conversationHistory[conversationHistory.length - 1]?.intent;
  if (lastIntent === INTENT_TYPES.SEARCH || lastIntent === INTENT_TYPES.REFINEMENT) {
    if (/\b(cheaper|more expensive|larger|smaller|different color|red|blue|green|cheaper than|under)\b/.test(lowerMessage)) {
      return {
        intent: INTENT_TYPES.REFINEMENT,
        confidence: 0.8,
        entities: extractSearchEntities(lowerMessage),
      };
    }
  }

  // Comparison patterns
  if (/\b(compare|vs|versus|difference|better|cheaper|more expensive)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.COMPARISON,
      confidence: 0.75,
      entities: {},
    };
  }

  // Product detail patterns
  if (/\b(tell me about|details|specs|specifications|features|size|dimensions|warranty)\b/.test(lowerMessage)) {
    return {
      intent: INTENT_TYPES.PRODUCT_DETAIL,
      confidence: 0.8,
      entities: {},
    };
  }

  // Default to browsing
  return {
    intent: INTENT_TYPES.BROWSING,
    confidence: 0.5,
    entities: {},
  };
};

/**
 * Extract search entities from message
 */
const extractSearchEntities = (message) => {
  const entities = {};

  // Extract price range
  const priceMatch = message.match(/(\d+)\s*-\s*(\d+)|under\s*(\d+)|below\s*(\d+)|under\s*rupees?\s*(\d+)/i);
  if (priceMatch) {
    if (priceMatch[1] && priceMatch[2]) {
      entities.priceMin = parseInt(priceMatch[1]);
      entities.priceMax = parseInt(priceMatch[2]);
    } else if (priceMatch[3] || priceMatch[4] || priceMatch[5]) {
      entities.priceMax = parseInt(priceMatch[3] || priceMatch[4] || priceMatch[5]);
    }
  }

  // Extract color
  const colorMatch = message.match(/\b(red|blue|green|black|white|yellow|pink|purple|orange|gray|silver|gold)\b/i);
  if (colorMatch) {
    entities.color = colorMatch[1].toLowerCase();
  }

  // Extract size
  const sizeMatch = message.match(/\b(small|medium|large|xl|xxl|xs|s|m|l|xl)\b/i);
  if (sizeMatch) {
    entities.size = sizeMatch[1].toLowerCase();
  }

  // Extract sort preference
  if (/cheapest|lowest/.test(message)) {
    entities.sortBy = "price_asc";
  } else if (/most expensive|highest|premium/.test(message)) {
    entities.sortBy = "price_desc";
  } else if (/best|highest rated/.test(message)) {
    entities.sortBy = "rating_desc";
  } else if (/newest|latest/.test(message)) {
    entities.sortBy = "date_desc";
  }

  return entities;
};

/**
 * Extract order entities
 */
const extractOrderEntities = (message) => {
  const entities = {};

  // Extract order number
  const orderNumberMatch = message.match(/#?\d{8,15}/);
  if (orderNumberMatch) {
    entities.orderNumber = orderNumberMatch[0].replace("#", "");
  }

  return entities;
};

module.exports = {
  detectIntent,
  extractSearchEntities,
  extractOrderEntities,
  INTENT_TYPES,
};
