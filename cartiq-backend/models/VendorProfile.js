// c:\Users\chira\cartIQ\cartiq-backend\models\VendorProfile.js
const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    storeName: {
      type: String,
      required: true,
    },

    storeDescription: String,

    storeLogo: String,

    storeBanner: String,

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    contactEmail: String,
    contactPhone: String,

    socialLinks: {
      website: String,
      facebook: String,
      instagram: String,
      twitter: String,
    },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    totalProducts: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    responseTimeHours: {
      type: Number,
      default: 24,
    },

    shippingDaysMin: {
      type: Number,
      default: 1,
    },

    shippingDaysMax: {
      type: Number,
      default: 7,
    },

    returnPolicy: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);
