// c:\Users\chira\cartIQ\cartiq-backend\services/paymentService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

/**
 * Create payment intent for Stripe
 */
const createPaymentIntent = async (userId, amount, orderId, metadata = {}) => {
  try {
    const transactionId = `TXN-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "inr",
      metadata: {
        userId,
        orderId,
        transactionId,
        ...metadata,
      },
    });

    // Create transaction record
    await Transaction.create({
      transactionId,
      user: userId,
      order: orderId,
      type: "payment",
      amount,
      currency: "INR",
      status: "pending",
      gateway: {
        provider: "stripe",
        gatewayTransactionId: paymentIntent.id,
        method: "card",
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Payment Intent Error:", error);
    throw error;
  }
};

/**
 * Verify payment
 */
const verifyPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const { transactionId } = paymentIntent.metadata;

      // Update transaction
      await Transaction.findOneAndUpdate(
        { transactionId },
        {
          status: "completed",
          completedAt: new Date(),
        }
      );

      return {
        success: true,
        status: "completed",
        transactionId,
      };
    }

    return {
      success: false,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("Payment Verification Error:", error);
    throw error;
  }
};

/**
 * Create refund
 */
const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
    };
  } catch (error) {
    console.error("Refund Error:", error);
    throw error;
  }
};

/**
 * Get transaction status
 */
const getTransactionStatus = async (transactionId) => {
  try {
    const transaction = await Transaction.findOne({ transactionId });
    return transaction;
  } catch (error) {
    console.error("Get Transaction Error:", error);
    throw error;
  }
};

/**
 * Handle webhook from Stripe
 */
const handleStripeWebhook = async (event) => {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await verifyPayment(event.data.object.id);
        break;
      case "payment_intent.payment_failed":
        await Transaction.findOneAndUpdate(
          { "gateway.gatewayTransactionId": event.data.object.id },
          { status: "failed" }
        );
        break;
      case "charge.refunded":
        // Handle refund
        break;
    }
  } catch (error) {
    console.error("Webhook Error:", error);
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
  createRefund,
  getTransactionStatus,
  handleStripeWebhook,
};
