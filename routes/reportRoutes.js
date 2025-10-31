// routes/reportRoutes.js
import express from "express";
import {
  getSuggestionReport,
  getSupplyOrderReport,
  getSystemReport, // ✅ جایگزین getOverviewReport
} from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📊 گزارش کلی سیستم (کاربران، پیام‌ها، اعلان‌ها، سفارش‌ها و ...)
router.get("/system", protect, adminOnly, getSystemReport);

// 🗒 گزارش پیشنهادات و نظرات
router.get("/suggestions", protect, adminOnly, getSuggestionReport);

// 📦 گزارش سفارش‌های تأمین کالا
router.get("/supply-orders", protect, adminOnly, getSupplyOrderReport);

export default router;
