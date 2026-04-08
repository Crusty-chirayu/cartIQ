// c:\Users\chira\cartIQ\cartiq-backend\models\TicketMessage.js
const mongoose = require("mongoose");

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    attachments: [
      {
        url: String,
        fileName: String,
      },
    ],

    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TicketMessage", ticketMessageSchema);
