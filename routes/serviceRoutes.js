// routes/serviceRoutes.js
import express from "express";
import multer from "multer";
import { protect, roleCheck } from "../middleware/authMiddleware.js";
import {
  addServiceReport,
  getServiceReports,
  deleteServiceReport,
} from "../controllers/serviceController.js";

const router = express.Router();

// ðŸ“ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø°Ø®ÛŒØ±Ù‡ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
const upload = multer({
  dest: "uploads/service/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// ðŸ“Œ Ø«Ø¨Øª Ú¯Ø²Ø§Ø±Ø´ Ø®Ø¯Ù…Ø§Øª (ÙÙ‚Ø· ØªÚ©Ù†Ø³ÛŒÙ† Ùˆ Ù†ØµØ§Ø¨)
router.post(
  "/:ticketId",
  protect,
  roleCheck(["technician", "installer"]),
  upload.fields([
    { name: "image", maxCount: 10 },
    { name: "video", maxCount: 5 },
    { name: "document", maxCount: 5 },
  ]),
  addServiceReport
);

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ÛŒ ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª
router.get(
  "/:ticketId",
  protect,
  roleCheck(["technician", "installer", "admin"]),
  getServiceReports
);

// ðŸ“Œ Ø­Ø°Ù Ú¯Ø²Ø§Ø±Ø´ (ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ Ú¯Ø²Ø§Ø±Ø´â€ŒØ¯Ù‡Ù†Ø¯Ù‡)
router.delete(
  "/:id",
  protect,
  roleCheck(["technician", "installer", "admin"]),
  deleteServiceReport
);

export default router;
