// c:\Users\chira\cartIQ\cartiq-backend\controllers\orderController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getOrderStats,
} = require("../services/orderService");
const { getPagination } = require("../utils/pagination");

/**
 * POST /api/orders
 * Create new order
 */
const placeOrder = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, billingAddress, paymentMethod } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  const order = await createOrder(
    req.user._id,
    cartItems,
    shippingAddress,
    billingAddress,
    paymentMethod
  );

  res.status(201).json(successResponse(order, "Order created", 201));
});

/**
 * GET /api/orders
 * Get user orders
 */
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const { orders, total } = await getUserOrders(req.user._id, page, limit);

  res.json(paginatedResponse(orders, page, limit, total));
});

/**
 * GET /api/orders/:id
 * Get order details
 */
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Verify ownership
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.json(successResponse(order));
});

/**
 * PATCH /api/orders/:id/cancel
 * Cancel order
 */
const cancelOrderCtrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const updatedOrder = await cancelOrder(id, reason);

  res.json(successResponse(updatedOrder, "Order cancelled"));
});

/**
 * PATCH /api/orders/:id/status
 * Update order status (seller/admin only)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Verify seller or admin
  const isSeller = order.items.some((item) => item.seller._id.toString() === req.user._id.toString());
  if (!isSeller && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const updatedOrder = await updateOrderStatus(id, status, note, req.user._id);

  res.json(successResponse(updatedOrder, "Status updated"));
});

/**
 * GET /api/orders/seller/incoming
 * Get seller's orders
 */
const getSellerOrdersCtrl = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const { orders, total } = await getSellerOrders(req.user._id, page, limit);

  res.json(paginatedResponse(orders, page, limit, total));
});

/**
 * GET /api/orders/:id/track
 * Track order
 */
const trackOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json(successResponse({
    orderNumber: order.orderNumber,
    status: order.status,
    tracking: order.tracking,
    statusHistory: order.statusHistory,
    estimatedDelivery: order.tracking?.estimatedDelivery,
  }));
});

/**
 * GET /api/orders/stats
 * Get order statistics
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await getOrderStats(req.user._id);

  res.json(successResponse(stats));
});

module.exports = {
  placeOrder,
  getOrders,
  getOrder,
  cancelOrderCtrl,
  updateStatus,
  getSellerOrdersCtrl,
  trackOrder,
  getStats,
};
