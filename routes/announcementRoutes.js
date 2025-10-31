import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ÙÙ‚Ø· Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù„Ø§Ú¯ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ù…ÛŒâ€ŒØªÙˆÙ†Ù† Ø¨Ø¨ÛŒÙ†Ù†
router.get("/", protect, getAnnouncements);
router.get("/:id", protect, getAnnouncementById);

// ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ†â€ŒÙ‡Ø§ Ø§Ø¬Ø§Ø²Ù‡ CRUD Ø¯Ø§Ø±Ù†Ø¯
router.post("/", protect, checkPermission("create_announcement"), createAnnouncement);
router.put("/:id", protect, checkPermission("edit_announcement"), updateAnnouncement);
router.delete("/:id", protect, checkPermission("delete_announcement"), deleteAnnouncement);

export default router;
