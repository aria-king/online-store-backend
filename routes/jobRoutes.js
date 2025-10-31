import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobHistory,   // âž• Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯
} from "../controllers/jobController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ù‡Ù…Ù‡ Ú©Ø§Ø±Ø¨Ø±Ø§Ù† â†’ Ù„ÛŒØ³Øª Ø¢Ú¯Ù‡ÛŒâ€ŒÙ‡Ø§
router.get("/", protect, getJobs);

// ðŸ“Œ Ù‡Ù…Ù‡ Ú©Ø§Ø±Ø¨Ø±Ø§Ù† â†’ Ø¯Ø±ÛŒØ§ÙØª ÛŒÚ© Ø¢Ú¯Ù‡ÛŒ
router.get("/:id", protect, getJobById);

// ðŸ“Œ ÙÙ‚Ø· Ù…Ø¯ÛŒØ± â†’ Ø¯Ø±ÛŒØ§ÙØª ØªØ§Ø±ÛŒØ®Ú†Ù‡ ØªØºÛŒÛŒØ±Ø§Øª Ø¢Ú¯Ù‡ÛŒ
router.get("/:id/history", protect, getJobHistory); // âž•

// ðŸ“Œ ÙÙ‚Ø· Ù…Ø¯ÛŒØ± â†’ Ø§ÛŒØ¬Ø§Ø¯ØŒ ÙˆÛŒØ±Ø§ÛŒØ´ØŒ Ø­Ø°Ù
router.post("/", protect, admin,
  auditMiddleware("Job", "create"), createJob);
router.put("/:id", protect, admin,auditMiddleware("Job", "update"), updateJob);
router.delete("/:id", protect, admin, auditMiddleware("Job", "delete"), deleteJob);

export default router;
