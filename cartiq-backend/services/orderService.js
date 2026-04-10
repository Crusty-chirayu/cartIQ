// c:\Users\chira\cartIQ\cartiq-backend\services\orderService.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

/**
 * Create new order from cart with atomic stock updates
 * Uses MongoDB transactions to prevent race conditions
 */
const createOrder = async (userId, cartItems, shippingAddress, billingAddress, paymentMethod) => {
  //CRITICAL: Use transaction to make stock validation + reduction atomic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate cart items and check stock atomically
    for (const item of cartItems) {
      // Use findByIdAndUpdate with atomic check to prevent TOCTOU race condition
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Calculate totals and prepare items
    let subtotal = 0;
    const items = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product).populate("seller").session(session);
      const totalPrice = item.unitPrice * item.quantity;

      items.push({
        product: item.product,
        variant: item.variant || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        seller: product.seller._id,
      });

      subtotal += totalPrice;

      // Atomically reduce stock in single operation - prevents overselling
      const updateResult = await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: -item.quantity, sales: item.quantity },
        },
        { new: true, session }
      );

      // Verify stock didn't go negative (extra safety check)
      if (updateResult.stock < 0) {
        throw new Error(`Stock validation failed for ${product.title}`);
      }
    }

    const shipping = 99; // TODO: Make configurable based on location/weight
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    // Create order within transaction
    const order = await Order.create(
      [{
        orderNumber,
        user: userId,
        items,
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date(),
            note: "Order created",
            updatedBy: userId,
          },
        ],
        shippingAddress,
        billingAddress,
        payment: {
          method: paymentMethod,
          status: "pending",
        },
        pricing: {
          subtotal,
          shipping,
          tax,
          discount: 0,
          total,
        },
      }],
      { session }
    );

    // Update user's order count within transaction
    await User.findByIdAndUpdate(
      userId,
      { $inc: { orderCount: 1 } },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    return order[0];

  } catch (error) {
    // Rollback on any error
    await session.abortTransaction();
    console.error("Create Order Error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status, note, updatedBy) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { status },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            note,
            updatedBy,
          },
        },
      },
      { new: true }
    );

    return order;
  } catch (error) {
    console.error("Update Order Status Error:", error);
    throw error;
  }
};

/**
 * Get user orders
 */
const getUserOrders = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("items.product", "title image price")
      .lean();

    const total = await Order.countDocuments({ user: userId });

    return { orders, total };
  } catch (error) {
    console.error("Get User Orders Error:", error);
    throw error;
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId) => {
  try {
    return await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate("items.product", "title image price")
      .populate("items.seller", "name");
  } catch (error) {
    console.error("Get Order Error:", error);
    throw error;
  }
};

/**
 * Cancel order with atomic stock restoration
 */
const cancelOrder = async (orderId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (!["pending", "confirmed", "processing"].includes(order.status)) {
      throw new Error("Order cannot be cancelled in current status");
    }

    // Atomically restore product stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: item.quantity, sales: -item.quantity },
        },
        { session }
      );
    }

    // Update order within transaction
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { status: "cancelled" },
        $push: {
          statusHistory: {
            status: "cancelled",
            timestamp: new Date(),
            note: reason || "Order cancelled by user",
            updatedBy: order.user,
          },
        },
      },
      { new: true, session }
    );

    await session.commitTransaction();
    return updatedOrder;

  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel Order Error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get seller orders
 */
const getSellerOrders = async (sellerId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      "items.seller": sellerId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("items.product", "title")
      .lean();

    const total = await Order.countDocuments({
      "items.seller": sellerId,
    });

    return { orders, total };
  } catch (error) {
    console.error("Get Seller Orders Error:", error);
    throw error;
  }
};

/**
 * Get order statistics
 */
const getOrderStats = async (userId) => {
  try {
    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$pricing.total" },
          avgOrderValue: { $avg: "$pricing.total" },
          statuses: { $push: "$status" },
        },
      },
    ]);

    return stats[0] || {};
  } catch (error) {
    console.error("Order Stats Error:", error);
    throw error;
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  getOrderStats,
};
