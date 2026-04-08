const express = require("express")
const router = express.Router()
const axios = require("axios")

const Product = require("../models/Product")

/* ================= AI CHAT (OPENROUTER) ================= */

router.post("/chat", async (req, res) => {

  try {

    const { message, history } = req.body

    if (!message) {
      return res.status(400).json({ message: "Message is required" })
    }

    const lowerMsg = message.toLowerCase()

    /* ================= SMART FILTER ================= */

    let query = {}

    // price filter
    const priceMatch = lowerMsg.match(/under (\d+)/)
    if (priceMatch) {
      query.price = { $lte: Number(priceMatch[1]) }
    }

    // category filter
    if (lowerMsg.includes("shoe")) query.category = "Shoes"
    if (lowerMsg.includes("laptop")) query.category = "Electronics"
    if (lowerMsg.includes("phone")) query.category = "Electronics"

    /* ================= SORT LOGIC ================= */

    let sortOption = {}

    if (lowerMsg.includes("cheap") || lowerMsg.includes("lowest")) {
      sortOption = { price: 1 }
    }

    if (lowerMsg.includes("expensive") || lowerMsg.includes("premium")) {
      sortOption = { price: -1 }
    }

    /* ================= FETCH PRODUCTS ================= */

    let products = await Product.find(query).sort(sortOption).limit(10)

    // fallback if no products
    if (products.length === 0) {
      products = await Product.find({}).limit(5)
    }

    /* ================= MEMORY ================= */

    const conversation = history
      ?.slice(-5)
      .map(m => `${m.role}: ${m.text}`)
      .join("\n") || ""

    /* ================= PROMPT ================= */

    const prompt = `
You are an AI shopping assistant.

Conversation:
${conversation}

User:
${message}

Products:
${JSON.stringify(products)}

Rules:
- Recommend relevant products only
- Mention product name and price
- Keep response short and helpful
`

    /* ================= OPENROUTER API ================= */

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful ecommerce assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "CartIQ",
          "Content-Type": "application/json"
        }
      }
    )

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response from AI"

    res.json({
      reply,
      products
    })

  } catch (error) {

    console.error(
      "AI ERROR:",
      error.response?.data || error.message
    )

    res.status(500).json({
      message: "AI request failed"
    })

  }

})

module.exports = router