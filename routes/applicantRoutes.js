import express from "express";
import {
  applyToJob,              // âœ… Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† applyForJob
  getApplicantsForJob,     // âœ… Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† getApplicantsByJob
  getApplicantById,        // âž• Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª
  updateApplicantStage,
  updateApplicantStatus,   // âž• ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø¬Ø¯Ø§ Ø§Ø² stage ,
  deleteApplicant,
  getApplicantHistory,
} from "../controllers/applicantController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù‡Ù…Ú©Ø§Ø±ÛŒ (Ú©Ø§Ø±Ø¨Ø± Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…â€ŒØ´Ø¯Ù‡ ÛŒØ§ Ù…Ù‡Ù…Ø§Ù†)
//    Ø§Ú¯Ø± Ø¨Ø®ÙˆØ§ÛŒ Ø¹Ù…ÙˆÙ…ÛŒ Ø¨Ø§Ø´Ù‡ØŒ protect Ø±Ùˆ Ù…ÛŒØ´Ù‡ Ø¨Ø±Ø¯Ø§Ø´Øª
router.post(
  "/job/:jobId/apply",
  protect,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idDoc", maxCount: 1 },
    { name: "criminalRecord", maxCount: 1 },
  ]),
  applyToJob
);

// ðŸ“Œ Ú¯Ø±ÙØªÙ† Ù„ÛŒØ³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ ÛŒÚ© Ø¢Ú¯Ù‡ÛŒ (Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ Ù¾Ø³Øªâ€ŒÚ©Ù†Ù†Ø¯Ù‡ Ø¢Ú¯Ù‡ÛŒ)
router.get("/job/:jobId", protect, getApplicantsForJob);

// ðŸ“Œ Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª (Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ Ù¾Ø³Øªâ€ŒÚ©Ù†Ù†Ø¯Ù‡ Ø¢Ú¯Ù‡ÛŒ)
router.get("/:applicantId", protect, getApplicantById);

// ðŸ“Œ ØªØ§Ø±ÛŒØ®Ú†Ù‡â€ŒÛŒ ØªØºÛŒÛŒØ±Ø§Øª ÛŒÚ© Ù…ØªÙ‚Ø§Ø¶ÛŒ (Ø¬Ø¯ÛŒØ¯)
router.get("/:applicantId/history", protect, getApplicantHistory);

// ðŸ“Œ ØªØºÛŒÛŒØ± Ù…Ø±Ø­Ù„Ù‡ Ù…ØªÙ‚Ø§Ø¶ÛŒ
router.put("/:applicantId/stage", protect, auditMiddleware("Applicant", "stage_change"), updateApplicantStage);

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ù…ØªÙ‚Ø§Ø¶ÛŒ (Ù…Ø«Ù„Ø§Ù‹ active / withdrawn / rejected)
router.put("/:applicantId/status", protect, auditMiddleware("Applicant", "status_change"), updateApplicantStatus);

// ðŸ“Œ Ø­Ø°Ù Ø¯Ø±Ø®ÙˆØ§Ø³Øª
router.delete("/:applicantId", protect, auditMiddleware("Applicant", "delete"), deleteApplicant);

export default router;
