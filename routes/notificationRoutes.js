// routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
  clearNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";
// import { checkPermission } from "../middleware/permissionMiddleware.js"; // Ø§Ú¯Ø± Ø¨Ø®ÙˆØ§ÛŒ Ø¨Ø±Ø§ÛŒ admin Ù…Ø­Ø¯ÙˆØ¯ Ú©Ù†ÛŒ

const router = express.Router();

/**
 * ðŸ”” Notification Routes
 * -------------------------------------------------
 * ðŸ“¦ Ø´Ø§Ù…Ù„: Ø¯Ø±ÛŒØ§ÙØªØŒ Ø®ÙˆØ§Ù†Ø¯Ù†ØŒ Ø­Ø°ÙØŒ Ùˆ Ø«Ø¨Øª audit
 * ðŸ“‹ Ù‡Ù…Ú¯ÛŒ Ø¨Ø§ auth + clientInfo + auditMiddleware
 */

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±
router.get(
  "/",
  protect,
  clientInfoMiddleware,
  auditMiddleware("Notification", "read"),
  getUserNotifications
);

// ðŸ“Œ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
router.put(
  "/read-all",
  protect,
  clientInfoMiddleware,
  auditMiddleware("Notification", "update"),
  readAllNotifications
);

// ðŸ“Œ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ ÛŒÚ© Ø§Ø¹Ù„Ø§Ù† Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
router.put(
  "/:id/read",
  protect,
  clientInfoMiddleware,
  auditMiddleware("Notification", "update"),
  readNotification
);

// ðŸ“Œ Ø­Ø°Ù Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§
router.delete(
  "/",
  protect,
  clientInfoMiddleware,
  auditMiddleware("Notification", "delete"),
  clearNotifications
);

// ðŸ“Œ Ø­Ø°Ù ÛŒÚ© Ø§Ø¹Ù„Ø§Ù†
router.delete(
  "/:id",
  protect,
  clientInfoMiddleware,
  auditMiddleware("Notification", "delete"),
  removeNotification
);

export default router;
