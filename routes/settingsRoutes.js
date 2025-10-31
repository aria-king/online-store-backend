import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ú¯Ø±ÙØªÙ† ØªÙ†Ø¸ÛŒÙ…Ø§Øª (Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¹Ø§Ø¯ÛŒ Ù‡Ù… Ù…ÛŒâ€ŒØªÙˆÙ†Ù† Ø¨Ø¨ÛŒÙ†Ù†)
router.get("/", protect, getSettings);
// ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª (ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ†)
router.put("/", protect, authorizeRoles("Ø§Ø¯Ù…ÛŒÙ†"), updateSettings);
// ÛŒØ§ Ø§Ú¯Ù‡ Ù…ÛŒâ€ŒØ®ÙˆØ§ÛŒ ÙÙ‚Ø· Ø¨Ø®Ø´ÛŒ Ø§Ø² ØªÙ†Ø¸ÛŒÙ…Ø§Øª ØªØºÛŒÛŒØ± Ú©Ù†Ù‡:
// router.patch("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
