import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ Ø¨Ø±Ø§ÛŒ Ú†Øª
router.post("/upload", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„" });
  }
});

export default router;
