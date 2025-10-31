// routes/auditLogRoutes.js
import express from "express";
import {
  getAuditLogs,
  getAuditLogById,
  clearAuditLogs,
} from "../controllers/auditLogController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";

const router = express.Router();

/**
 * ðŸ§¾ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØª Ù„Ø§Ú¯â€ŒÙ‡Ø§ÛŒ Ø³ÛŒØ³ØªÙ…ÛŒ (Audit Logs)
 * -------------------------------------------------
 * âœ… ÙÙ‚Ø· Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¨Ø§ Ù…Ø¬ÙˆØ² "audit:read" ÛŒØ§ Ù…Ø¯ÛŒØ±Ø§Ù† Ø§Ø±Ø´Ø¯ (SuperAdmin)
 * âœ… ØªÙ…Ø§Ù… Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ Ø¨Ø§ clientInfo + auditMiddleware Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯
 */

// ðŸ“‹ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ú©Ø§Ù…Ù„ Ù„Ø§Ú¯â€ŒÙ‡Ø§ Ø¨Ø§ ÙÛŒÙ„ØªØ± Ùˆ Ø¬Ø³ØªØ¬Ùˆ
router.get(
  "/",
  protect,
  clientInfoMiddleware,
  checkPermission(["audit:read", "audit:view"]),
  auditMiddleware("AuditLog", "view"),
  getAuditLogs
);

// ðŸ” Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ù„Ø§Ú¯ Ø®Ø§Øµ
router.get(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission(["audit:read", "audit:view"]),
  auditMiddleware("AuditLog", "view"),
  getAuditLogById
);

// ðŸ§¹ Ø­Ø°Ù Ù‡Ù…Ù‡ Ù„Ø§Ú¯â€ŒÙ‡Ø§ (ÙÙ‚Ø· SuperAdmin)
router.delete(
  "/",
  protect,
  clientInfoMiddleware,
  adminOnly, // â›” Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø­Ø°Ù ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ±Ø§Ù† Ø¹Ø§Ø¯ÛŒ
  checkPermission(["audit:clear", "audit:delete"]),
  auditMiddleware("AuditLog", "delete"),
  clearAuditLogs
);

export default router;
