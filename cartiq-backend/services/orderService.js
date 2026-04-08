// c:\Users\chira\cartIQ\cartiq-backend\services\orderService.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

/**
 * Create new order from cart
 */
const createOrder = async (userId, cartItems, shippingAddress, billingAddress, paymentMethod) => {
  try {
    // Validate cart items
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.title || "product"}`);
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    const items = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product).populate("seller");
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

      // Reduce product stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sales: item.quantity },
      });
    }

    const shipping = 99; // Fixed shipping for now
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    // Create order
    const order = await Order.create({
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
    });

    // Update user's order count
    await User.findByIdAndUpdate(userId, {
      $inc: { "aiProfile.recentOrders": 1 },
    });

    return order;
  } catch (error) {
    console.error("Create Order Error:", error);
    throw error;
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
 * Cancel order
 */
const cancelOrder = async (orderId, reason) => {
  try {
    const order = await Order.findById(orderId);

    if (!["pending", "confirmed", "processing"].includes(order.status)) {
      throw new Error("Order cannot be cancelled in current status");
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sales: -item.quantity },
      });
    }

    // Update order
    return await updateOrderStatus(orderId, "cancelled", reason);
  } catch (error) {
    console.error("Cancel Order Error:", error);
    throw error;
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
