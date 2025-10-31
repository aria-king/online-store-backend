// utils/fileService.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ðŸ“Œ Ú¯Ø±ÙØªÙ† Ù…Ø³ÛŒØ± Ú©Ø§Ù…Ù„ ÙØ§ÛŒÙ„ Ø±ÙˆÛŒ Ø³Ø±ÙˆØ±
 * @param {String} filePath - Ù…Ø³ÛŒØ± ÙØ§ÛŒÙ„ (Ù…Ø«Ù„Ø§Ù‹ "/uploads/training/abc.png")
 * @returns {String} Ù…Ø³ÛŒØ± Ù…Ø·Ù„Ù‚ ÙØ§ÛŒÙ„
 */
const getAbsolutePath = (filePath) => {
  if (!filePath) return null;
  return path.join(process.cwd(), filePath.startsWith("/") ? filePath.slice(1) : filePath);
};

/**
 * ðŸ“Œ Ø­Ø°Ù ÛŒÚ© ÙØ§ÛŒÙ„
 * @param {String} filePath
 */
export const deleteFile = (filePath) => {
  if (!filePath) return;

  const absolutePath = getAbsolutePath(filePath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ÙØ§ÛŒÙ„:", absolutePath, err.message);
    } else {
      console.log("ðŸ—‘ ÙØ§ÛŒÙ„ Ø­Ø°Ù Ø´Ø¯:", absolutePath);
    }
  });
};

/**
 * ðŸ“Œ Ø­Ø°Ù Ú†Ù†Ø¯ ÙØ§ÛŒÙ„
 * @param {String[]} filePaths
 */
export const deleteFiles = (filePaths = []) => {
  filePaths.forEach((file) => deleteFile(file));
};

/**
 * ðŸ“Œ Ø¨Ø±Ø±Ø³ÛŒ Ù…Ø¹ØªØ¨Ø± Ø¨ÙˆØ¯Ù† ÙØ§ÛŒÙ„ (Ù†ÙˆØ¹ Ùˆ Ø­Ø¬Ù…)
 * @param {Object} file - ÙØ§ÛŒÙ„ Ø¢Ù¾Ù„ÙˆØ¯ÛŒ multer
 * @param {String[]} allowedTypes - mimeTypes Ù…Ø¬Ø§Ø² (Ù…Ø«Ù„Ø§Ù‹ ["image/png","image/jpeg","video/mp4"])
 * @param {Number} maxSizeMB - Ø­Ø¯Ø§Ú©Ø«Ø± Ø­Ø¬Ù… Ù…Ø¬Ø§Ø² Ø¨Ù‡ Ù…Ú¯Ø§Ø¨Ø§ÛŒØª
 */
export const validateFile = (file, allowedTypes = [], maxSizeMB = 10) => {
  if (!file) return { valid: false, message: "ÙØ§ÛŒÙ„ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª" };

  if (allowedTypes.length && !allowedTypes.includes(file.mimetype)) {
    return { valid: false, message: "Ù†ÙˆØ¹ ÙØ§ÛŒÙ„ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª" };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, message: `Ø­Ø¬Ù… ÙØ§ÛŒÙ„ Ù†Ø¨Ø§ÛŒØ¯ Ø¨ÛŒØ´ØªØ± Ø§Ø² ${maxSizeMB}MB Ø¨Ø§Ø´Ø¯` };
  }

  return { valid: true };
};
