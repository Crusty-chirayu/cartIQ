// c:\Users\chira\cartIQ\cartiq-backend\controllers\supportController.js
const { asyncHandler } = require("../middleware/errorHandlerMiddleware");
const SupportTicket = require("../models/SupportTicket");
const TicketMessage = require("../models/TicketMessage");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { getPagination } = require("../utils/pagination");
const notificationService = require("../services/notificationService");

/**
 * Create a new support ticket
 */
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority = "medium" } = req.body;

  const ticket = new SupportTicket({
    userId: req.user._id,
    subject,
    description,
    category,
    priority,
    status: "open",
  });

  await ticket.save();
  await ticket.populate("userId", "name email");

  // Send notification
  await notificationService.sendNotification(req.user._id, "ticket_created", {
    ticketId: ticket._id,
    subject: ticket.subject,
  });

  res.status(201).json(
    successResponse(ticket, "Support ticket created successfully")
  );
});

/**
 * Get user's support tickets
 */
const getTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };

  const tickets = await SupportTicket.find(query)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SupportTicket.countDocuments(query);

  res.json(
    successResponse(
      { tickets, pagination: { page, limit, total } },
      "Tickets fetched"
    )
  );
});

/**
 * Get ticket detail with messages
 */
const getTicketDetail = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate("userId", "name email")
    .populate("messages");

  if (!ticket) {
    return res
      .status(404)
      .json(errorResponse("Ticket not found"));
  }

  // Check access
  if (
    ticket.userId._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(errorResponse("Access denied"));
  }

  res.json(successResponse(ticket, "Ticket fetched"));
});

/**
 * Add message to ticket
 */
const addMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res
      .status(404)
      .json(errorResponse("Ticket not found"));
  }

  // Check access
  if (
    ticket.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json(errorResponse("Access denied"));
  }

  const message = new TicketMessage({
    ticketId: ticket._id,
    userId: req.user._id,
    content,
    isStaff: req.user.role === "admin",
  });

  await message.save();

  // Update ticket lastUpdated
  ticket.lastUpdated = new Date();
  await ticket.save();

  // Notify relevant party
  const notifyUserId =
    req.user.role === "admin" ? ticket.userId : null;
  if (notifyUserId) {
    await notificationService.sendNotification(
      notifyUserId,
      "ticket_replied",
      { ticketId: ticket._id }
    );
  }

  res.status(201).json(
    successResponse(message, "Message added successfully")
  );
});

/**
 * Update ticket status (admin/support only)
 */
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, resolution } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res
      .status(404)
      .json(errorResponse("Ticket not found"));
  }

  ticket.status = status;
  if (resolution && status === "resolved") {
    ticket.resolution = resolution;
  }
  ticket.lastUpdated = new Date();

  await ticket.save();

  // Notify user
  await notificationService.sendNotification(
    ticket.userId,
    "ticket_status_updated",
    { ticketId: ticket._id, status }
  );

  res.json(successResponse(ticket, "Ticket status updated"));
});

/**
 * Escalate ticket to higher priority
 */
const escalateTicket = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res
      .status(404)
      .json(errorResponse("Ticket not found"));
  }

  if (ticket.priority === "critical") {
    return res
      .status(400)
      .json(
        errorResponse(
          "Ticket is already at highest priority"
        )
      );
  }

  const priorityLevels = ["low", "medium", "high", "critical"];
  const currentIndex = priorityLevels.indexOf(
    ticket.priority
  );
  ticket.priority = priorityLevels[currentIndex + 1] || "critical";
  ticket.lastUpdated = new Date();

  await ticket.save();

  res.json(successResponse(ticket, "Ticket escalated"));
});

module.exports = {
  createTicket,
  getTickets,
  getTicketDetail,
  addMessage,
  updateTicketStatus,
  escalateTicket,
};
