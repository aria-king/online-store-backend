import express from "express";
import { createFeedback, getAllFeedback, updateFeedbackStatus } from "../controllers/feedbackController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø±/Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯/Ø§Ù†ØªÙ‚Ø§Ø¯
router.post("/", protect, createFeedback);

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø¨Ø§Ø²Ø®ÙˆØ±Ø¯Ù‡Ø§ (Admin)
router.get("/", protect, adminOnly, getAllFeedback);

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª (Admin)
router.put("/:feedbackId/status", protect, adminOnly, updateFeedbackStatus);

export default router;
