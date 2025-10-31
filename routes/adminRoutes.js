import express from "express";
import { getStats } from "../controllers/statsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// âœ… Ø­Ø§Ù„Ø§ ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ† Ù…ÛŒâ€ŒØªÙˆÙ†Ù‡ Ø¢Ù…Ø§Ø± Ø¨Ú¯ÛŒØ±Ù‡
router.get("/", protect, adminOnly, getStats);

export default router;
