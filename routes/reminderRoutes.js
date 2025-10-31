import express from "express";
import {
  createReminder,
  getReminders,
  toggleReminder,
  deleteReminder,
} from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", checkPermission("reminder:create"), createReminder);
router.get("/", checkPermission("reminder:view"), getReminders);
router.put("/:id/toggle", checkPermission("reminder:edit"), toggleReminder);
router.delete("/:id", checkPermission("reminder:delete"), deleteReminder);

// ðŸ”¹ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ Ø¨Ø±Ø§ÛŒ Ú©Ø±ÙˆÙ† Ø¬Ø§Ø¨ Ø¯Ø§Ø®Ù„ÛŒ)
import { checkDueReminders } from "../services/reminderService.js";
router.get("/check/cron", checkDueReminders); // ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ø§Ø¯Ù…ÛŒÙ†â€ŒÙ‡Ø§ ÛŒØ§ Ø³ÛŒØ³ØªÙ… Ø¯Ø§Ø®Ù„ÛŒ

export default router;
