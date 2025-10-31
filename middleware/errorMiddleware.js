import Log from "../models/logModel.js";
import logger from "../utils/logger.js";

// ðŸ“Œ Ù‡Ù†Ø¯Ù„ Ú©Ø±Ø¯Ù† route Ù‡Ø§ÛŒ Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯ (404)
export const notFound = (req, res, next) => {
  const error = new Error(`ðŸ” Ù…Ø³ÛŒØ± ${req.originalUrl} ÛŒØ§ÙØª Ù†Ø´Ø¯`);
  res.status(404);
  next(error);
};

// ðŸ“Œ Ù‡Ù†Ø¯Ù„ Ú©Ø±Ø¯Ù† Ù‡Ù…Ù‡ Ø®Ø·Ø§Ù‡Ø§ + Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø± Ù„Ø§Ú¯â€ŒÙ‡Ø§
export const errorHandler = async (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø± Ø¯ÛŒØªØ§Ø¨ÛŒØ³
  try {
    await Log.create({
      level: "error",
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      user: req.user?._id || null,
    });
  } catch (logErr) {
    logger.error(`DB Log Error: ${logErr.message}`);
  }

  // Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø± ÙØ§ÛŒÙ„ Ùˆ Ú©Ù†Ø³ÙˆÙ„
  logger.error(
    `${req.method} ${req.originalUrl} - ${err.message} ${
      process.env.NODE_ENV !== "production" ? err.stack : ""
    }`
  );

  // Ø§Ø±Ø³Ø§Ù„ Ù¾Ø§Ø³Ø® Ø¨Ù‡ Ú©Ù„Ø§ÛŒÙ†Øª
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
