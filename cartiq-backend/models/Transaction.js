// c:\Users\chira\cartIQ\cartiq-backend\models\Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    type: {
      type: String,
      enum: ["payment", "refund", "adjustment", "payout"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },

    gateway: {
      provider: String,
      gatewayTransactionId: String,
      method: String,
    },

    metadata: mongoose.Schema.Types.Mixed,

    failureReason: String,

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1 });
transactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
