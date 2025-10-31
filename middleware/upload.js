// ðŸ“‚ middleware/upload.js
import multer from "multer";
import path from "path";

// Ù…Ø­Ù„ Ø°Ø®ÛŒØ±Ù‡ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ù¾ÙˆØ´Ù‡ uploads Ø¯Ø± Ø±ÛŒØ´Ù‡ Ù¾Ø±ÙˆÚ˜Ù‡
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ø§Ø³Ù… ÛŒÚ©ØªØ§
  },
});

// ÙÙ‚Ø· Ø¹Ú©Ø³â€ŒÙ‡Ø§ Ù…Ø¬Ø§Ø²Ù†Ø¯
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("ÙÙ‚Ø· ÙØ§ÛŒÙ„ ØªØµÙˆÛŒØ±ÛŒ Ù…Ø¬Ø§Ø² Ø§Ø³Øª"));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
