import express from "express";
import fs from "fs";
import path from "path";
import { createBackup, restoreBackup } from "../utils/backup.js";

const router = express.Router();
const BACKUP_DIR = path.join(process.cwd(), "backups");

// ðŸ“Œ Ú¯Ø±ÙØªÙ† Ø¨Ú©Ø§Ù¾ Ø¯Ø³ØªÛŒ
router.post("/create", async (req, res) => {
  try {
    const backupPath = await createBackup("manual");
    res.json({ message: "âœ… Ø¨Ú©Ø§Ù¾ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ú¯Ø±ÙØªÙ‡ Ø´Ø¯", backupPath });
  } catch (err) {
    console.error("âŒ Error in create backup:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ú¯Ø±ÙØªÙ† Ø¨Ú©Ø§Ù¾" });
  }
});

// ðŸ“Œ Ù„ÛŒØ³Øª Ø¨Ú©Ø§Ù¾â€ŒÙ‡Ø§
router.get("/list", (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter((file) => file.endsWith(".zip"))
      .map((file) => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        createdAt: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
      }));

    res.json({ backups: files });
  } catch (err) {
    console.error("âŒ Error in list backups:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ú¯Ø±ÙØªÙ† Ù„ÛŒØ³Øª Ø¨Ú©Ø§Ù¾â€ŒÙ‡Ø§" });
  }
});

// ðŸ“Œ Ø±ÛŒØ³ØªÙˆØ± Ø¨Ú©Ø§Ù¾
router.post("/restore", async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ message: "Ù†Ø§Ù… ÙØ§ÛŒÙ„ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª" });

    const filePath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "ÙØ§ÛŒÙ„ Ø¨Ú©Ø§Ù¾ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });
    }

    await restoreBackup(filePath);

    res.json({ message: "âœ… Ø±ÛŒØ³ØªÙˆØ± Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ Error in restore backup:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø±ÛŒØ³ØªÙˆØ± Ø¨Ú©Ø§Ù¾" });
  }
});

export default router;
