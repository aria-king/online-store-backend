// routes/orders.js
import express from "express";
import { body, validationResult } from "express-validator";
import createError from "http-errors";

import {
  createOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🧩 Middleware اعتبارسنجی درخواست‌ها
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || "درخواست نامعتبر است";
    return next(createError(400, firstError));
  }
  next();
};

/**
 * 🛒 ایجاد سفارش (فقط کاربران لاگین‌کرده)
 */
router.post(
  "/",
  protect,
  [
    body("items")
      .isArray({ min: 1 })
      .withMessage("لیست اقلام باید حداقل یک مورد داشته باشد"),
    body("shippingAddress")
      .notEmpty()
      .withMessage("آدرس ارسال الزامی است"),
  ],
  validateRequest,
  createOrder
);

/**
 * 📦 دریافت سفارش‌های کاربر جاری
 */
router.get("/my", protect, getOrders);

/**
 * 🧾 دریافت همه سفارش‌ها (فقط مدیران)
 */
router.get("/", protect, adminOnly, getAllOrders);

/**
 * 🔁 بروزرسانی وضعیت سفارش (فقط مدیر)
 */
router.put("/:orderId/status", protect, adminOnly, updateOrderStatus);

/**
 * 🗑️ حذف سفارش (فقط مدیر)
 */
router.delete("/:orderId", protect, adminOnly, deleteOrder);

export default router;
