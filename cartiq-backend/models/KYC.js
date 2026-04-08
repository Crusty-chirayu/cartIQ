// c:\Users\chira\cartIQ\cartiq-backend\models\KYC.js
const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected", "expired"],
      default: "not_submitted",
    },

    businessName: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: ["individual", "partnership", "pvt_ltd", "llp"],
      required: true,
    },

    registrationNumber: String,

    panNumber: {
      type: String,
      required: true,
    },

    gstNumber: String,

    businessAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    documents: [
      {
        type: {
          type: String,
          enum: ["pan_certificate", "business_registration", "gst_certificate", "bank_statement", "shop_photo"],
        },
        url: String,
        verificationStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],

    bankAccount: {
      holderName: String,
      accountNumber: String,
      ifscCode: String,
    },

    rejectionReason: String,

    submittedAt: Date,
    verifiedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KYC", kycSchema);
