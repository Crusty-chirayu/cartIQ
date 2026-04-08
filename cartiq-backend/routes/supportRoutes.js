// c:\Users\chira\cartIQ\cartiq-backend\routes\supportRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketDetail,
  addMessage,
  updateTicketStatus,
  escalateTicket,
} = require("../controllers/supportController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

// Customer and Support routes
router.post("/tickets", createTicket);
router.get("/tickets", getTickets);
router.get("/tickets/:id", getTicketDetail);
router.post("/tickets/:id/messages", addMessage);

// Support staff and admin only
router.patch("/tickets/:id/status", authorizeRoles("support", "admin"), updateTicketStatus);
router.post("/tickets/:id/escalate", authorizeRoles("support", "admin"), escalateTicket);

module.exports = router;
