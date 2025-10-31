import express from "express";
import { createBackorder, getAllBackorders, updateBackorderStatus } from "../controllers/backorderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ø«Ø¨Øª Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§
router.post("/", protect, createBackorder);

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§ (Admin)
router.get("/", protect, adminOnly, getAllBackorders);

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª (Admin)
router.put("/:backorderId/status", protect, adminOnly, updateBackorderStatus);

export default router;
