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
      .json(errorResponse("Order not found", 404));
  }

  // Verify order belongs to user
  if (order.user._id.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json(errorResponse("Unauthorized", 403));
  }

  try {
    const paymentData = await paymentService.initiatePayment(
      orderId,
      method
    );

    res.json(
      successResponse(
        paymentData,
        "Payment initiated successfully",
        200
      )
    );
  } catch (error) {
    res
      .status(400)
      .json(errorResponse(error.message, 400));
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
        .json(errorResponse("Payment verification failed", 400));
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
        { order, transaction },
        "Payment verified successfully",
        200
      )
    );
  } catch (error) {
    res
      .status(400)
      .json(errorResponse(error.message));
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
 * CRITICAL: Must verify webhook signatures to prevent spoofing
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const { provider } = req.params;

  try {
    if (provider === "stripe") {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        return res
          .status(400)
          .json(errorResponse("Missing stripe-signature header", 400));
      }

      // CRITICAL: Must use raw body for signature verification
      const rawBody = req.rawBody || JSON.stringify(req.body);
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        return res
          .status(400)
          .json(errorResponse(`Webhook signature verification failed: ${err.message}`, 400));
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

          const order = await Order.findById(transaction.orderId);
          if (order) {
            order.payment.status = "completed";
            order.payment.paidAt = new Date();
            order.status = "confirmed";
            await order.save();

            // Notify user
            await notificationService.sendNotification(
              order.user,
              "payment_confirmed",
              { orderId: order._id }
            );
          }
        }
      }

    } else if (provider === "razorpay") {
      const crypto = require("crypto");
      const hmac = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      );

      const rawBody = req.rawBody || JSON.stringify(req.body);
      hmac.update(rawBody);
      const computedSignature = hmac.digest("hex");
      const receivedSignature = req.headers["x-razorpay-signature"];

      if (computedSignature !== receivedSignature) {
        return res
          .status(400)
          .json(errorResponse("Invalid Razorpay webhook signature", 400));
      }

      const payload = (typeof req.body === "string") ? JSON.parse(req.body) : req.body;

      if (payload.event === "payment.authorized") {
        const transaction = await Transaction.findOne({
          transactionId: payload.payload.payment.entity.id,
        });

        if (transaction) {
          transaction.status = "completed";
          await transaction.save();

          const order = await Order.findById(transaction.orderId);
          if (order) {
            order.payment.status = "completed";
            order.payment.paidAt = new Date();
            order.status = "confirmed";
            await order.save();

            await notificationService.sendNotification(
              order.user,
              "payment_confirmed",
              { orderId: order._id }
            );
          }
        }
      }
    } else {
      return res
        .status(400)
        .json(errorResponse("Invalid payment provider", 400));
    }

    res.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    res
      .status(500)
      .json(errorResponse("Webhook processing failed", 500));
  }
});

module.exports = {
  initiatePayment,
  verifyPayment,
  getTransactions,
  handleWebhook,
};
