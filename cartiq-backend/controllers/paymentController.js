// c:\Users\chira\cartIQ\cartiq-backend\controllers\paymentController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const paymentService = require("../services/paymentService");
const notificationService = require("../services/notificationService");

/**
 * Initiate payment for order
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, method } = req.body;

  const order = await Order.findById(orderId).populate("userId");
  if (!order) {
    return res
      .status(404)
      .json(errorResponse(404, "Order not found"));
  }

  // Verify order belongs to user
  if (order.userId._id.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json(errorResponse(403, "Unauthorized"));
  }

  try {
    const paymentData = await paymentService.initiatePayment(
      orderId,
      method
    );

    res.json(
      successResponse(
        200,
        paymentData,
        "Payment initiated successfully"
      )
    );
  } catch (error) {
    res
      .status(400)
      .json(errorResponse(400, error.message));
  }
});

/**
 * Verify payment completion
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, transactionId, gateway, signature } = req.body;

  try {
    const verified = await paymentService.verifyPayment(
      transactionId,
      gateway,
      signature
    );

    if (!verified) {
      return res
        .status(400)
        .json(errorResponse(400, "Payment verification failed"));
    }

    const order = await Order.findById(orderId);
    order.payment.status = "completed";
    order.payment.transactionId = transactionId;
    order.payment.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    // Log transaction
    const transaction = new Transaction({
      orderId,
      userId: req.user._id,
      amount: order.pricing.total,
      method: gateway,
      status: "completed",
      transactionId,
    });
    await transaction.save();

    // Send confirmation email
    await notificationService.sendNotification(
      req.user._id,
      "payment_confirmed",
      { orderId, amount: order.pricing.total }
    );

    res.json(
      successResponse(
        200,
        { order, transaction },
        "Payment verified successfully"
      )
    );
  } catch (error) {
    res
      .status(400)
      .json(errorResponse(400, error.message));
  }
});

/**
 * Get user's transaction history
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const transactions = await Transaction.find({
    userId: req.user._id,
  })
    .populate("orderId", "orderNumber pricing")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({
    userId: req.user._id,
  });

  res.json(
    successResponse(
      200,
      {
        transactions,
        pagination: { page, limit, total },
      },
      "Transactions fetched"
    )
  );
});

/**
 * Handle payment webhook (Stripe/Razorpay)
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const payload = req.body;

  try {
    // Verify webhook signature
    let event;

    if (provider === "stripe") {
      const stripe = require("stripe")(
        process.env.STRIPE_SECRET_KEY
      );
      const sig = req.headers[
        "stripe-signature"
      ];
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res
          .status(400)
          .json(
            errorResponse(
              400,
              `Webhook Error: ${err.message}`
            )
          );
      }

      // Handle charge.succeeded event
      if (event.type === "charge.succeeded") {
        const charge = event.data.object;
        const transaction = await Transaction.findOne({
          transactionId: charge.id,
        });

        if (transaction) {
          transaction.status = "completed";
          await transaction.save();

          const order = await Order.findById(
            transaction.orderId
          );
          if (order) {
            order.payment.status = "completed";
            order.status = "confirmed";
            await order.save();
          }
        }
      }
    } else if (provider === "razorpay") {
      // Razorpay webhook validation
      const crypto = require("crypto");
      const shasum = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      );
      shasum.update(JSON.stringify(payload));
      const digest = shasum.digest("hex");

      if (digest !== req.headers["x-razorpay-signature"]) {
        return res
          .status(400)
          .json(errorResponse(400, "Invalid signature"));
      }

      if (payload.event === "payment.authorized") {
        const transaction = await Transaction.findOne({
          transactionId: payload.payload.payment.entity.id,
        });

        if (transaction) {
          transaction.status = "completed";
          await transaction.save();

          const order = await Order.findById(
            transaction.orderId
          );
          if (order) {
            order.payment.status = "completed";
            order.status = "confirmed";
            await order.save();
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json(errorResponse(500, "Webhook processing failed"));
  }
});

module.exports = {
  initiatePayment,
  verifyPayment,
  getTransactions,
  handleWebhook,
};
