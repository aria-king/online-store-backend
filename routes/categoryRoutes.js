import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree, // ðŸ“Œ Ø¯Ø±Ø®Øª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* ================================
   ðŸ“Œ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
================================ */
router.get("/", getCategories); // Ù‡Ù…Ù‡ Ø¯Ø³ØªÙ‡â€ŒÙ‡Ø§ (Ù„ÛŒØ³Øª Ø³Ø§Ø¯Ù‡ + Ø¬Ø³ØªØ¬Ùˆ)
router.get("/tree", getCategoryTree); // ðŸ“Œ Ø¯Ø³ØªÙ‡â€ŒÙ‡Ø§ Ø¨Ù‡ Ø´Ú©Ù„ Ø¯Ø±Ø®Øª
router.get("/:id", getCategoryById);
router.post("/", protect, authorizeRoles("Ø§Ø¯Ù…ÛŒÙ†", "Ù…Ø¯ÛŒØ± Ù…Ø­ØªÙˆØ§"), createCategory);
router.put("/:id", protect, authorizeRoles("Ø§Ø¯Ù…ÛŒÙ†", "Ù…Ø¯ÛŒØ± Ù…Ø­ØªÙˆØ§"), updateCategory);
router.delete("/:id", protect, authorizeRoles("Ø§Ø¯Ù…ÛŒÙ†"), deleteCategory);

export default router;
