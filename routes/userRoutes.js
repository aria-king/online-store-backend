// routes/userRoutes.js
import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// 🧾 ثبت‌نام کاربر
// ==========================
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  register
);

// ==========================
// 🔑 ورود کاربر
// ==========================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// ==========================
// 👤 دریافت پروفایل کاربر (با احراز هویت)
// ==========================
router.get("/profile", protect, getProfile);

// ==========================
// ✏️ بروزرسانی پروفایل (با احراز هویت)
// ==========================
router.put(
  "/profile",
  protect,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  updateProfile
);

// ==========================
// 🗑️ حذف کاربر (با احراز هویت)
// ==========================
router.delete("/profile", protect, deleteUser);

export default router;
