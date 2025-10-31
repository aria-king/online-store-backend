import multer from "multer";
import fs from "fs";
import path from "path";

// Ù…Ø³ÛŒØ± Ø°Ø®ÛŒØ±Ù‡
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ðŸ“‚ ØªÙ†Ø¸ÛŒÙ… Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage });

// ðŸ“ Ø­Ø°Ù ÙÛŒØ²ÛŒÚ©ÛŒ ÙØ§ÛŒÙ„ Ø§Ø² Ø¯ÛŒØ³Ú©
export const deleteFileFromDisk = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("âš ï¸ Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø§Ø² Ø¯ÛŒØ³Ú©:", err);
  }
};
