// c:\Users\chira\cartIQ\cartiq-backend\models\RecentlyViewed.js
const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    limit: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
