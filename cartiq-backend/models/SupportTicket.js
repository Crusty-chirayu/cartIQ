// c:\Users\chira\cartIQ\cartiq-backend\models\SupportTicket.js
const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
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

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["shipping", "payment", "product", "complaint", "return", "other"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_customer", "resolved", "closed", "escalated"],
      default: "open",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketMessage",
      },
    ],

    resolution: {
      type: String,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
