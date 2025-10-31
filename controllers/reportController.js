// backend/controllers/reportController.js
import User from "../models/userModel.js";
import Order from "../models/Order.js";
import Notification from "../models/notificationModel.js";
import Suggestion from "../models/suggestionModel.js";
import SupplyOrder from "../models/supplyOrderModel.js";
import { getMessageStats } from "./chatController.js";

// 🧩 تابع کمکی برای فیلتر تاریخ
const buildDateFilter = (from, to) => {
  if (!from && !to) return undefined;
  const filter = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);
  return filter;
};

// ==============================
// 📊 گزارش کاربران
// ==============================
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });

    const stats = { totalUsers, activeUsers, blockedUsers };
    if (res) return res.json(stats);
    return stats;
  } catch (err) {
    console.error("❌ getUserStats error:", err);
    if (res) res.status(500).json({ message: "خطا در دریافت آمار کاربران" });
  }
};

// ==============================
// 🛒 گزارش سفارش‌ها
// ==============================
export const getOrderReport = async (req, res) => {
  try {
    const { from, to, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (from || to) filter.createdAt = buildDateFilter(from, to);

    const totalOrders = await Order.countDocuments(filter);
    const completedOrders = await Order.countDocuments({ ...filter, status: "completed" });
    const pendingOrders = await Order.countDocuments({ ...filter, status: "pending" });

    const report = { totalOrders, completedOrders, pendingOrders };

    if (res) return res.json(report);
    return report;
  } catch (err) {
    console.error("❌ getOrderReport error:", err);
    if (res) res.status(500).json({ message: "خطا در دریافت گزارش سفارش‌ها" });
  }
};

// ==============================
// 🔔 گزارش اعلان‌ها
// ==============================
export const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    const stats = { totalNotifications, unreadNotifications };
    if (res) return res.json(stats);
    return stats;
  } catch (err) {
    console.error("❌ getNotificationStats error:", err);
    if (res) res.status(500).json({ message: "خطا در دریافت آمار اعلان‌ها" });
  }
};

// ==============================
// 💬 گزارش پیشنهادات و نظرات
// ==============================
export const getSuggestionReport = async (req, res) => {
  try {
    const { from, to, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (from || to) filter.createdAt = buildDateFilter(from, to);

    const suggestions = await Suggestion.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("❌ getSuggestionReport error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت گزارش نظرات" });
  }
};

// ==============================
// 📦 گزارش سفارش‌های تأمین کالا
// ==============================
export const getSupplyOrderReport = async (req, res) => {
  try {
    const { from, to, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (from || to) filter.createdAt = buildDateFilter(from, to);

    const supplyOrders = await SupplyOrder.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: supplyOrders.length,
      supplyOrders,
    });
  } catch (err) {
    console.error("❌ getSupplyOrderReport error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت گزارش سفارش‌های تأمین کالا" });
  }
};

// ==============================
// 📈 گزارش کلی (Overview / System)
// ==============================
export const getSystemReport = async (req, res) => {
  try {
    const userStats = await getUserStats();
    const orderStats = await getOrderReport();
    const notificationStats = await getNotificationStats();
    const messageStats = await getMessageStats();

    const overview = {
      users: userStats,
      orders: orderStats,
      notifications: notificationStats,
      messages: messageStats,
    };

    if (res) return res.json(overview);
    return overview;
  } catch (err) {
    console.error("❌ getSystemReport error:", err);
    if (res) res.status(500).json({ message: "خطا در ساخت گزارش کلی سیستم" });
  }
};
