const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);