//routes/suggestionRoutes.js
import express from "express";
import { createSuggestion, getSuggestions, updateSuggestion } from "../controllers/suggestionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSuggestion); // Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯/Ù†Ø¸Ø±/Ø§Ù†ØªÙ‚Ø§Ø¯
router.get("/", protect, adminOnly, getSuggestions); // Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯Ù‡Ø§
router.put("/:id", protect, adminOnly, updateSuggestion); // Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ùˆ Ù¾Ø§Ø³Ø®

export default router;
