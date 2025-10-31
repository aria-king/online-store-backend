// routes/roleRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";

const router = express.Router();

/**
 * ðŸ§© Role Management Routes
 * -----------------------------------------------------------
 * Ø´Ø§Ù…Ù„:
 *  - Ú©Ù†ØªØ±Ù„ Ø³Ø·Ø­ Ø¯Ø³ØªØ±Ø³ÛŒ (Permission)
 *  - Ø«Ø¨Øª Ø±ÙØªØ§Ø± Ú©Ø§Ø±Ø¨Ø± (Audit Trail)
 *  - Ø«Ø¨Øª Ø§Ø·Ù„Ø§Ø¹Ø§Øª ÙÙ†ÛŒ (Client Info)
 */

// âœ… Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´ Ø¬Ø¯ÛŒØ¯
router.post(
  "/",
  protect,
  clientInfoMiddleware,
  checkPermission(["role:create", "admin"]),
  auditMiddleware("Role", "create"),
  asyncHandler(createRole)
);

// ðŸ“‹ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ù†Ù‚Ø´â€ŒÙ‡Ø§
router.get(
  "/",
  protect,
  clientInfoMiddleware,
  checkPermission("role:read"),
  asyncHandler(getRoles)
);

// ðŸ” Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¬Ø²Ø¦ÛŒØ§Øª Ù†Ù‚Ø´
router.get(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission("role:read"),
  asyncHandler(getRoleById)
);

// âœï¸ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù†Ù‚Ø´
router.put(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission("role:update"),
  auditMiddleware("Role", "update"),
  asyncHandler(updateRole)
);

// ðŸ—‘ï¸ Ø­Ø°Ù Ù†Ù‚Ø´
router.delete(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission(["role:delete", "admin"]),
  auditMiddleware("Role", "delete"),
  asyncHandler(deleteRole)
);

export default router;
