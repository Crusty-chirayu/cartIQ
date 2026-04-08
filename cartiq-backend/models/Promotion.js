// c:\Users\chira\cartIQ\cartiq-backend\models\Promotion.js
const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    type: {
      type: String,
      enum: ["flash_sale", "seasonal", "category", "new_user", "loyalty", "referral"],
      required: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed", "bogo"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    maxBudget: Number,

    isActive: {
      type: Boolean,
      default: true,
    },

    priority: {
      type: Number,
      default: 0,
    },

    banner: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Promotion", promotionSchema);
