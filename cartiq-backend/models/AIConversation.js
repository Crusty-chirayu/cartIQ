// c:\Users\chira\cartIQ\cartiq-backend\models\AIConversation.js
const mongoose = require("mongoose");

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    conversationId: {
      type: String,
      unique: true,
      required: true,
    },

    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        intent: String,
        filters: mongoose.Schema.Types.Mixed,
        productsReturned: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],

    context: {
      cartItems: Number,
      previousIntents: [String],
      lastAction: String,
      sessionDuration: Number,
    },

    summary: String,

    status: {
      type: String,
      enum: ["active", "archived", "flagged"],
      default: "active",
    },

    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ user: 1 });
aiConversationSchema.index({ conversationId: 1 });
aiConversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AIConversation", aiConversationSchema);
