//routes/warrantyRoutes.js
import express from "express";
import {
  createWarranty,
  getProductWarranty,
  useWarranty,
  updateWarrantyStatus,
} from "../controllers/warrantyController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ (Ù…Ø¯ÛŒØ±)
router.post("/", protect, admin, createWarranty);

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ù…Ø­ØµÙˆÙ„
router.get("/:productId", protect, getProductWarranty);

// ðŸ“Œ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
router.post("/:warrantyId/use", protect, useWarranty);

// ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ú¯Ø§Ø±Ø§Ù†ØªÛŒ (Ù…Ø¯ÛŒØ±)
router.put("/:warrantyId/status", protect, admin, updateWarrantyStatus);

export default router;
