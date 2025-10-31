import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  searchUsers,
  searchMessages,
  searchNotifications,
} from "../controllers/searchController.js";

const router = express.Router();

// ðŸ” Ø¬Ø³ØªØ¬ÙˆÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†
router.get("/users", protect, searchUsers);

// âœ‰ï¸ Ø¬Ø³ØªØ¬ÙˆÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§
router.get("/messages", protect, searchMessages);

// ðŸ”” Ø¬Ø³ØªØ¬ÙˆÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§
router.get("/notifications", protect, searchNotifications);

export default router;
