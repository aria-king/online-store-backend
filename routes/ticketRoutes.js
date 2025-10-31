// routes/ticketRoutes.js
import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  deleteTicket,
} from "../controllers/ticketController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ù…Ø´ØªØ±ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª
router.post("/", protect, createTicket);

// ðŸ“Œ Ù„ÛŒØ³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ (Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø¨ÛŒÙ†Ø¯ Ù‡Ù…Ù‡ - Ú©Ø§Ø±Ø¨Ø± ÙÙ‚Ø· Ù…Ø§Ù„ Ø®ÙˆØ¯Ø´)
router.get("/", protect, getTickets);

// ðŸ“Œ Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª
router.get("/:id", protect, getTicketById);

// ðŸ“Œ Ø§Ø®ØªØµØ§Øµ Ø¨Ù‡ ØªÚ©Ù†Ø³ÛŒÙ† (ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ†)
router.put("/:ticketId/assign", protect, roleCheck(["admin"]), assignTicket);

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª (ØªÚ©Ù†Ø³ÛŒÙ† ÛŒØ§ Ø§Ø¯Ù…ÛŒÙ†)
router.put("/:ticketId/status", protect, roleCheck(["technician", "admin"]), updateTicketStatus);

// ðŸ“Œ Ø­Ø°Ù Ø¯Ø±Ø®ÙˆØ§Ø³Øª (Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ ØµØ§Ø­Ø¨ ØªÛŒÚ©Øª â†’ Ø¯Ø§Ø®Ù„ Ú©Ù†ØªØ±Ù„Ø± Ú†Ú© Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ…)
router.delete("/:id", protect, deleteTicket);

export default router;
