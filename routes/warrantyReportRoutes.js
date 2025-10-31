//routes/warrantyReportRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getWarrantyStats,
  getWarrantyUsageStats,
  getWarrantyCostStats,
  getWarrantyGrowth,
  getTopWarrantyProducts,
} from "../controllers/warrantyReportController.js";

const router = express.Router();

// ðŸ“Œ Ù‡Ù…Ù‡ Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ±
router.get("/stats", protect, admin, getWarrantyStats);
router.get("/usage", protect, admin, getWarrantyUsageStats);
router.get("/costs", protect, admin, getWarrantyCostStats);
router.get("/growth", protect, admin, getWarrantyGrowth);
router.get("/top-products", protect, admin, getTopWarrantyProducts);

export default router;
