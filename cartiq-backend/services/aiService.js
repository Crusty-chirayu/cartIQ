// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const AIConversation = require("../models/AIConversation");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Handle AI chat with product knowledge and general ChatGPT-like responses
 */
const handleAIChat = async (userId, userMessage, conversationId = null) => {
  try {
    let conversation;

    // Get or create conversation
    if (conversationId) {
      conversation = await AIConversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId,
        messages: [],
      });
    }

    // Get user's cart for context
    const userCart = await Cart.findOne({ userId }).populate("items.product");
    const cartProducts = userCart?.items?.map((item) => item.product) || [];

    // Get all available products for product search
    const allProducts = await Product.find({ isActive: true })
      .limit(100)
      .select("_id name description price category image");

    // Format conversation history for AI context
    const conversationHistory = conversation.messages
      .slice(-10)
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

    // Detect if user is asking for product recommendations
    const isProductQuery = /product|buy|suggest|recommend|filter|price|find|show|category|search/.test(
      userMessage.toLowerCase()
    );

    let systemPrompt = `You are CartIQ, a helpful shopping assistant. 

Current Cart Items: ${
      cartProducts.length > 0
        ? cartProducts.map((p) => `${p.name} (₹${p.price})`).join(", ")
        : "Empty"
    }

Available Products: ${allProducts
      .slice(0, 20)
      .map((p) => `${p.name} (₹${p.price}, Category: ${p.category})`)
      .join("; ")}

${
  isProductQuery
    ? `The user is asking about products. If they want recommendations, suggest specific products from the available products list with names and prices. Format: "I recommend: Product Name (₹Price)"`
    : `The user may be asking a general question. Answer helpfully and naturally.`
}

If the user asks for product suggestions:
1. Understand their needs from the message
2. Search through available products
3. Recommend 3-5 products with names and prices
4. Be specific and helpful`;

    // Call Google Generative AI
    const chat = model.startChat({
      history: conversationHistory,
    });

    const response = await chat.sendMessage(systemPrompt + "\n\nUser: " + userMessage);
    const aiText = response.response.text();

    // Extract product suggestions from response
    const suggestedProducts = [];
    if (isProductQuery) {
      const productMatches = aiText.match(
        /(\w+[\w\s]*?)\s*\(₹([\d,]+)\)/g
      );
      if (productMatches) {
        for (const match of productMatches) {
          const [name, price] = match
            .replace(/[()]/g, "")
            .split("₹");
          const product = allProducts.find(
            (p) =>
              p.name.toLowerCase().includes(name.toLowerCase().trim()) ||
              name.toLowerCase().includes(p.name.toLowerCase())
          );
          if (product && suggestedProducts.length < 5) {
            suggestedProducts.push(product);
          }
        }
      }
    }

    // Save to conversation
    await AIConversation.findByIdAndUpdate(
      conversation._id,
      {
        $push: {
          messages: [
            { role: "user", text: userMessage },
            {
              role: "assistant",
              text: aiText,
              products: suggestedProducts.map((p) => p._id),
            },
          ],
        },
        lastMessageAt: new Date(),
      }
    );

    return {
      conversationId: conversation._id,
      reply: aiText,
      products: suggestedProducts,
    };
  } catch (error) {
    console.error("AI Chat Error:", error);
    return {
      reply:
        "I encountered an error processing your request. Please try again.",
      products: [],
    };
  }
};

/**
 * Get conversation history
 */
const getConversationHistory = async (conversationId) => {
  const conversation = await AIConversation.findById(conversationId).populate(
    "messages.products"
  );
  return conversation?.messages || [];
};

/**
 * Clear conversation
 */
const clearConversation = async (conversationId) => {
  await AIConversation.findByIdAndUpdate(conversationId, { messages: [] });
};

/**
 * Generate product description using AI
 */
const generateProductDescription = async (title, category, attributes = {}) => {
  try {
    const prompt = `Generate a compelling, SEO-friendly product description for:
Title: ${title}
Category: ${category}
Attributes: ${JSON.stringify(attributes)}

Make it 2-3 sentences, professional and engaging.`;

    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Description generation error:", error);
    return `High-quality ${title} in ${category} category.`;
  }
};

/**
 * Generate product tags using AI
 */
const generateProductTags = async (title, description, category) => {
  try {
    const prompt = `Generate 5-8 SEO keywords/tags for a product:
Title: ${title}
Description: ${description}
Category: ${category}

Return as comma-separated values only.`;

    const response = await model.generateContent(prompt);
    const tags = response.response.text().split(",").map((tag) => tag.trim());
    return tags;
  } catch (error) {
    console.error("Tags generation error:", error);
    return [category, title.split(" ")[0]];
  }
};

/**
 * Suggest pricing for a product
 */
const suggestPricing = async (productTitle, category, costPrice) => {
  try {
    const prompt = `Suggest selling price for:
Title: ${productTitle}
Category: ${category}
Cost Price: ₹${costPrice}

Consider: market rates, profit margin (30-50%), competition
Return ONLY a JSON: {"suggestedPrice": number, "margin": number, "reason": string}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestedPrice: costPrice * 1.5 };
  } catch (error) {
    console.error("Pricing suggestion error:", error);
    return { suggestedPrice: costPrice * 1.5, margin: 50 };
  }
};

module.exports = {
  handleAIChat,
  getConversationHistory,
  clearConversation,
  generateProductDescription,
  generateProductTags,
  suggestPricing,
};