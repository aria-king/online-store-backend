import express from "express";
import {
  addExpertise,
  getProductExpertise,
  updateExpertiseStatus,
  deleteExpertise,
} from "../controllers/expertiseController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ø«Ø¨Øª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ Ø¬Ø¯ÛŒØ¯
router.post("/", protect, addExpertise);

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒâ€ŒÙ‡Ø§ÛŒ ÛŒÚ© Ù…Ø­ØµÙˆÙ„
router.get("/:productId", protect, getProductExpertise);

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ (ÙÙ‚Ø· Ù…Ø¯ÛŒØ±)
router.put("/:id/status", protect, admin, updateExpertiseStatus);

// ðŸ“Œ Ø­Ø°Ù Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ (Ú©Ø§Ø±Ø´Ù†Ø§Ø³ ÛŒØ§ Ù…Ø¯ÛŒØ±)
router.delete("/:id", protect, deleteExpertise);

export default router;
