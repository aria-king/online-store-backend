// middleware/roleMiddleware.js

// ðŸ“Œ Ø¨Ø±Ø±Ø³ÛŒ Ù†Ù‚Ø´ Ú©Ø§Ø±Ø¨Ø±
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "â›” Ø¯Ø³ØªØ±Ø³ÛŒ ØºÛŒØ±Ù…Ø¬Ø§Ø²" });
    }
    next();
  };
};
