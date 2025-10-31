// controllers/orderController.js
import createError from "http-errors";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * 🧾 ایجاد سفارش جدید
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, shippingAddress, notes } = req.body;
    const userId = req.user?._id;

    if (!items || items.length === 0) {
      return next(createError(400, "لیست محصولات نمی‌تواند خالی باشد"));
    }

    // بررسی قیمت و محاسبه جمع کل
    const totalPrice = items.reduce((sum, item) => {
      if (!item.price || item.price <= 0) {
        throw createError(400, "قیمت محصول معتبر نیست");
      }
      return sum + item.price * item.quantity;
    }, 0);

    const order = await Order.create({
      user: userId,
      items,
      totalPrice,
      paymentMethod,
      shippingAddress,
      notes,
      status: "pending",
      history: [{ action: "Order Created", performedBy: userId, date: new Date() }],
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    next(err);
  }
};

/**
 * 📋 دریافت سفارش‌های کاربر جاری
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("❌ getOrders error:", err);
    next(err);
  }
};

/**
 * 📦 دریافت همه سفارش‌ها (برای مدیر)
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, user, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    console.error("❌ getAllOrders error:", err);
    next(err);
  }
};

/**
 * 🔄 بروزرسانی وضعیت سفارش
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return next(createError(404, "سفارش یافت نشد"));

    order.status = status || order.status;
    order.history.push({
      action: `Status changed to ${status}`,
      performedBy: userId,
      date: new Date(),
    });
    order.updatedAt = new Date();

    await order.save();
    res.status(200).json({ success: true, message: "وضعیت سفارش بروزرسانی شد", order });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    next(err);
  }
};

/**
 * 🗑️ حذف سفارش (مدیر)
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return next(createError(404, "سفارش یافت نشد"));

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "سفارش با موفقیت حذف شد",
    });
  } catch (err) {
    console.error("❌ deleteOrder error:", err);
    next(err);
  }
};
