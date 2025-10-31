import express from "express";
import { protect, roleCheck } from "../middleware/authMiddleware.js";
import multer from "multer";
import {
  addTrainingContent,
  getTrainingContent,
  getTrainingContentById,
  updateTrainingContent,
  deleteTrainingContent
} from "../controllers/trainingContentController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/training/" });

// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ù…Ø­ØªÙˆØ§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ (ÙÙ‚Ø· Ù…Ø¯ÛŒØ±)
router.post("/", protect, roleCheck(["admin"]), upload.single("file"), addTrainingContent);

// ðŸ“Œ Ù„ÛŒØ³Øª Ù…Ø­ØªÙˆØ§ Ø¢Ù…ÙˆØ²Ø´ÛŒ (ØªÚ©Ù†Ø³ÛŒÙ† / Ù†ØµØ§Ø¨ / Ø§Ø¯Ù…ÛŒÙ†)
router.get("/", protect, roleCheck(["technician", "installer", "admin"]), getTrainingContent);

// ðŸ“Œ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ù…Ø­ØªÙˆØ§
router.get("/:id", protect, roleCheck(["technician", "installer", "admin"]), getTrainingContentById);

// ðŸ“Œ ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø­ØªÙˆØ§ (ÙÙ‚Ø· Ù…Ø¯ÛŒØ±)
router.put("/:id", protect, roleCheck(["admin"]), upload.single("file"), updateTrainingContent);

// ðŸ“Œ Ø­Ø°Ù Ù…Ø­ØªÙˆØ§ (ÙÙ‚Ø· Ù…Ø¯ÛŒØ±)
router.delete("/:id", protect, roleCheck(["admin"]), deleteTrainingContent);

export default router;
