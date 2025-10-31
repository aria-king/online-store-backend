//routes/authRoutes.js
import express from "express";
import {
  loginUser,
  registerUser,
  verifyHardwareKey,
  verifyBiometric,
  logoutUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";
import upload from "../middleware/upload.js"; // ðŸ‘ˆ Ù…Ø³ÛŒØ± ØµØ­ÛŒØ­ (Ø¨Ø§ ØªÙˆØ¬Ù‡ Ø¨Ù‡ Ù†Ø§Ù… Ù¾Ø±ÙˆÚ˜Ù‡)

const router = express.Router();

/**
 * ðŸ”¹ Auth Routes
 * ----------------------------------------------------------
 * Ø´Ø§Ù…Ù„ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…ØŒ ÙˆØ±ÙˆØ¯ØŒ MFA (biometric/hardware)ØŒ Ùˆ Ø®Ø±ÙˆØ¬ Ú©Ø§Ø±Ø¨Ø±
 * Ù…Ø¬Ù‡Ø² Ø¨Ù‡ clientInfo + auditTrail
 */

// ðŸ§¾ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ú©Ø§Ø±Ø¨Ø± (Ø¨Ø§ Ø¢Ù¾Ù„ÙˆØ¯ ØªØµÙˆÛŒØ± Ù¾Ø±ÙˆÙØ§ÛŒÙ„)
router.post(
  "/register",
  clientInfoMiddleware,
  upload.single("profileImage"), // âœ… Ù†ÛŒØ§Ø²ÛŒ Ø¨Ù‡ ?. ÛŒØ§ fallback Ù†ÛŒØ³Øª
  auditMiddleware("User", "create"),
  registerUser
);

// ðŸ” ÙˆØ±ÙˆØ¯ Ú©Ø§Ø±Ø¨Ø±
router.post(
  "/login",
  clientInfoMiddleware,
  auditMiddleware("User", "login"),
  loginUser
);

// ðŸ”‘ Ø§Ø­Ø±Ø§Ø² MFA (Ø¯Ø³Ú©ØªØ§Ù¾)
router.post(
  "/verify-hardware",
  clientInfoMiddleware,
  auditMiddleware("User", "mfa_verify"),
  verifyHardwareKey
);

// ðŸ“± Ø§Ø­Ø±Ø§Ø² MFA (Ø¨ÛŒÙˆÙ…ØªØ±ÛŒÚ©)
router.post(
  "/verify-biometric",
  clientInfoMiddleware,
  auditMiddleware("User", "mfa_verify"),
  verifyBiometric
);

// ðŸšª Ø®Ø±ÙˆØ¬ Ú©Ø§Ø±Ø¨Ø± (Ù…Ø­Ø§ÙØ¸Øªâ€ŒØ´Ø¯Ù‡)
router.post(
  "/logout",
  protect,
  clientInfoMiddleware,
  auditMiddleware("User", "logout"),
  logoutUser
);

export default router;

 