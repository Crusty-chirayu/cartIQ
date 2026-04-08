// c:\Users\chira\cartIQ\cartiq-backend\models\Payout.js
const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payoutNumber: {
      type: String,
      unique: true,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    period: {
      startDate: Date,
      endDate: Date,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "rejected"],
      default: "pending",
    },

    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      accountType: String,
      ifscCode: String,
      bankName: String,
    },

    upiId: String,

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    notes: String,

    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ seller: 1 });

module.exports = mongoose.model("Payout", payoutSchema);
