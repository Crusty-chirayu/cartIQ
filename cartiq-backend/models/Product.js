const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    shortDescription: {
      type: String,
      maxlength: 500,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    comparePrice: {
      type: Number,
      min: 0,
    },

    costPrice: {
      type: Number,
      min: 0,
    },

    images: [
      {
        url: { type: String, required: true },
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    tags: [String],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    variants: [
      {
        name: String,
        options: [
          {
            label: String,
            priceModifier: { type: Number, default: 0 },
            stock: { type: Number, default: 0 },
            sku: String,
          },
        ],
      },
    ],

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    barcode: String,

    status: {
      type: String,
      enum: ["draft", "active", "paused", "deleted"],
      default: "draft",
    },

    attributes: mongoose.Schema.Types.Map,

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    aiData: {
      generatedDescription: String,
      suggestedTags: [String],
      demandScore: { type: Number, default: 0, min: 0, max: 100 },
    },

    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    sales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);