// routes/serviceHistoryRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { protect, roleCheck } from "../middleware/authMiddleware.js";
import {
  createServiceHistory,
  getServiceHistoryByTicket,
  updateServiceHistory,
  deleteServiceHistory,
  removeAttachment,
} from "../controllers/serviceHistoryController.js";

const router = express.Router();

/**
 * ðŸ“ ØªÙ†Ø¸ÛŒÙ… Multer Ø¨Ø±Ø§ÛŒ Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/service/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/png",
    "image/jpeg",
    "video/mp4",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Ù†ÙˆØ¹ ÙØ§ÛŒÙ„ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * ========================
 * ðŸ§° Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØª Ø®Ø¯Ù…Ø§Øª
 * ========================
 */

// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ø±Ú©ÙˆØ±Ø¯ Ø³Ø±ÙˆÛŒØ³ (ØªÚ©Ù†Ø³ÛŒÙ† / Ù†ØµØ§Ø¨)
router.post(
  "/:ticketId",
  protect,
  roleCheck(["technician", "installer"]),
  upload.fields([
    { name: "image" },
    { name: "video" },
    { name: "document" },
  ]),
  createServiceHistory
);

// ðŸ“Œ Ù…Ø´Ø§Ù‡Ø¯Ù‡ ØªØ§Ø±ÛŒØ®Ú†Ù‡ Ø®Ø¯Ù…Ø§Øª ÛŒÚ© ØªÛŒÚ©Øª (Ø§Ø¯Ù…ÛŒÙ†ØŒ ØªÚ©Ù†Ø³ÛŒÙ†ØŒ Ù†ØµØ§Ø¨)
router.get(
  "/ticket/:ticketId",
  protect,
  roleCheck(["technician", "installer", "admin"]),
  getServiceHistoryByTicket
);

// ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø³Ø±ÙˆÛŒØ³ (Ø§Ø¯Ù…ÛŒÙ†ØŒ ØªÚ©Ù†Ø³ÛŒÙ†ØŒ Ù†ØµØ§Ø¨)
router.put(
  "/:id",
  protect,
  roleCheck(["technician", "installer", "admin"]),
  upload.fields([
    { name: "image" },
    { name: "video" },
    { name: "document" },
  ]),
  updateServiceHistory
);

// ðŸ“Œ Ø­Ø°Ù Ú©Ù„ Ø±Ú©ÙˆØ±Ø¯ Ø³Ø±ÙˆÛŒØ³ (ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ†)
router.delete("/:id", protect, roleCheck(["admin"]), deleteServiceHistory);

// ðŸ“Œ Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø®Ø§Øµ Ø§Ø² Ø³Ø±ÙˆÛŒØ³ (Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ ØªÚ©Ù†Ø³ÛŒÙ†)
router.delete(
  "/:id/remove-file",
  protect,
  roleCheck(["admin", "technician", "installer"]),
  removeAttachment
);

export default router;
