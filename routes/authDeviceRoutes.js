// routes/authDeviceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerDevice,
  verifyHardwareKey,
  getUserDevices,
  registerBiometric,
  verifyBiometric,
  deactivateDevice,
  deleteDevice,
} from "../controllers/authDeviceController.js";

const router = express.Router();

/* ======================================
   🔐 مسیرهای مربوط به دستگاه‌های احراز هویت
====================================== */

// 📱 ثبت دستگاه جدید
router.post("/register", protect, registerDevice);

// 🧩 تأیید کلید سخت‌افزاری
router.post("/verify", protect, verifyHardwareKey);

// 🗂️ دریافت لیست دستگاه‌های کاربر
router.get("/list", protect, getUserDevices);

/* ======================================
   🧬 مسیرهای بایومتریک (اثر انگشت، چهره و ...)
====================================== */

// ثبت داده بایومتریک
router.post("/biometric/register", protect, registerBiometric);

// تأیید داده بایومتریک
router.post("/biometric/verify", protect, verifyBiometric);

/* ======================================
   ⚙️ مدیریت دستگاه‌ها
====================================== */

// غیرفعال‌سازی دستگاه
router.patch("/deactivate/:deviceId", protect, deactivateDevice);

// حذف دستگاه
router.delete("/delete/:deviceId", protect, deleteDevice);

export default router;
