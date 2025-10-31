import express from "express";
import {
  sendMessage,
  getMessages,
  getAllChats,
  markAsRead,
  deleteMessage,       // ðŸ“Œ Ø­Ø°Ù Ù¾ÛŒØ§Ù… ØªÚ©ÛŒ
  deleteConversation,  // ðŸ“Œ Ø­Ø°Ù Ú©Ù„ Ù…Ú©Ø§Ù„Ù…Ù‡
} from "../controllers/chatController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { searchMessages } from "../controllers/chatController.js";

const router = express.Router();

// âœ… Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù… (Ù…ØªÙ†ØŒ ÙØ§ÛŒÙ„ØŒ ØªØµÙˆÛŒØ±ØŒ ÙˆÛŒØ¯ÛŒÙˆ)
router.post("/send", protect, upload.single("file"), sendMessage);

// âœ… Ø¯Ø±ÛŒØ§ÙØª Ú†Øª Ø¨ÛŒÙ† Ø¯Ùˆ Ú©Ø§Ø±Ø¨Ø±
router.get("/:userId", protect, getMessages);

// âœ… Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
router.put("/:userId/read", protect, markAsRead);

// âœ… Ø­Ø°Ù Ù¾ÛŒØ§Ù… ØªÚ©ÛŒ
router.delete("/message/:messageId", protect, deleteMessage);

// âœ… Ø­Ø°Ù Ú©Ù„ Ù…Ú©Ø§Ù„Ù…Ù‡ Ø¨ÛŒÙ† Ø¯Ùˆ Ú©Ø§Ø±Ø¨Ø±
router.delete("/conversation/:userId", protect, deleteConversation);

// âœ… Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú†Øªâ€ŒÙ‡Ø§ (ÙÙ‚Ø· Ù…Ø¯ÛŒØ±)
router.get("/", protect, adminOnly, getAllChats);

router.get("/search", protect, searchMessages);
export default router;
