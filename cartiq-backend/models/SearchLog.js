// c:\Users\chira\cartIQ\cartiq-backend\models\SearchLog.js
const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    query: {
      type: String,
      required: true,
    },

    filters: mongoose.Schema.Types.Mixed,

    resultsCount: Number,

    resultClicked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    sessionId: String,

    source: {
      type: String,
      enum: ["ai_chat", "search_bar", "category_browse", "filter"],
      default: "search_bar",
    },

    intent: String,
  },
  {
    timestamps: true,
  }
);

searchLogSchema.index({ user: 1 });
searchLogSchema.index({ query: 1 });
searchLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model("SearchLog", searchLogSchema);
