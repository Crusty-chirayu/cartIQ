// c:\Users\chira\cartIQ\cartiq-backend\models\ProductView.js
const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sessionId: String,

    referrer: String,

    userAgent: String,

    ipAddress: String,

    viewDuration: Number,

    addedToCart: {
      type: Boolean,
      default: false,
    },

    purchased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

productViewSchema.index({ product: 1 });
productViewSchema.index({ user: 1 });
productViewSchema.index({ createdAt: 1 });

module.exports = mongoose.model("ProductView", productViewSchema);
