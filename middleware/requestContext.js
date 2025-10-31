// middleware/requestContext.js
export const requestContext = (req, res, next) => {
  try {
    // Ú¯Ø±ÙØªÙ† IP (Ù¾Ø´Øª Ù¾Ø±Ø§Ú©Ø³ÛŒ Ù‡Ù… Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ù‡)
    const ip =
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress ||
      null;

    // Ú¯Ø±ÙØªÙ† User-Agent
    const userAgent = req.headers["user-agent"] || null;

    // Ø§Ú¯Ø± context Ø§Ø² Ù‚Ø¨Ù„ Ù†Ø¨ÙˆØ¯ØŒ Ø¨Ø³Ø§Ø²
    if (!req.context) req.context = {};

    req.context.ip = ip;
    req.context.userAgent = userAgent;

    next();
  } catch (err) {
    console.error("âŒ requestContext middleware error:", err);
    next(); // Ø­ØªÛŒ Ø§Ú¯Ø± Ø®Ø·Ø§ Ø¨ÙˆØ¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø¯Ø§Ù…Ù‡ Ù¾ÛŒØ¯Ø§ Ú©Ù†Ù‡
  }
};
