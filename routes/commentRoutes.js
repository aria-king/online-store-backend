import express from "express";
import {
  createComment,
  getProductComments,
  updateCommentStatus,
  likeComment,
} from "../controllers/commentController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ø«Ø¨Øª Ù†Ø¸Ø±
router.post("/", authMiddleware, createComment);

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù†Ø¸Ø±Ù‡Ø§ÛŒ ØªØ§ÛŒÛŒØ¯ Ø´Ø¯Ù‡ ÛŒÚ© Ù…Ø­ØµÙˆÙ„
router.get("/product/:productId", getProductComments);

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ù†Ø¸Ø± (Ø§Ø¯Ù…ÛŒÙ†)
router.put("/:productId/review/:reviewId/status", authMiddleware, adminMiddleware, updateCommentStatus);

// ðŸ“Œ Ù„Ø§ÛŒÚ© Ù†Ø¸Ø±
router.post("/:productId/review/:reviewId/like", authMiddleware, likeComment);

export default router;
