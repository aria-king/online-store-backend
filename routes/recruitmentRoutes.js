// routes/recruitmentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";

import {
  createJob, updateJob, getJobs, getJobById, deleteJob,
} from "../controllers/jobController.js";

import {
  applyToJob, getApplicantsForJob, updateApplicantStage, deleteApplicant
} from "../controllers/applicantController.js";

const router = express.Router();

// jobs
router.get("/", protect, getJobs); // Ø§Ú¯Ø± Ù…ÛŒâ€ŒØ®ÙˆØ§ÛŒ Ø¹Ù…ÙˆÙ…ÛŒ Ø¨Ø§Ø´Ù‡ØŒ Ù…ÛŒâ€ŒØªÙˆÙ†ÛŒ protect Ø±Ùˆ Ø¨Ø±Ø¯Ø§Ø±ÛŒ
router.get("/:id", protect, getJobById);
router.post("/", protect, authorizeRoles("admin"), createJob);
router.put("/:id", protect, authorizeRoles("admin"), updateJob);
router.delete("/:id", protect, authorizeRoles("admin"), deleteJob);

// apply (Ø§Ù¾Ù„ÙˆØ¯ Ú†Ù†Ø¯ ÙØ§ÛŒÙ„)
router.post(
  "/:jobId/apply",
  protect,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idDoc", maxCount: 1 },
    { name: "criminalRecord", maxCount: 1 },
  ]),
  applyToJob
);

// applicants (admin / job poster)
router.get("/:jobId/applicants", protect, getApplicantsForJob);
router.put("/applicant/:applicantId/stage", protect, updateApplicantStage);
router.delete("/applicant/:applicantId", protect, deleteApplicant);

export default router;
