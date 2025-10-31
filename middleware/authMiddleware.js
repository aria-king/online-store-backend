// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * 🧠 Helper: دریافت اطلاعات کلاینت (IP + Agent)
 */
const getClientInfo = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";

  return {
    ip,
    userAgent: req.headers["user-agent"] || "unknown",
    method: req.method,
    url: req.originalUrl,
  };
};

/**
 * 🧩 Middleware: احراز هویت با JWT
 * - اطلاعات کاربر را از توکن استخراج می‌کند
 * - در req.user و req.authContext قرار می‌دهد
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "❌ توکن ارسال نشده است." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded?.id && decoded?.roles) {
      user = {
        _id: decoded.id,
        roles: decoded.roles,
        isSuperAdmin: decoded.isSuperAdmin || false,
      };
    } else {
      user = await User.findById(decoded.id)
        .select("-password -otpCode -otpExpire")
        .populate("roles", "name permissions");

      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "کاربر یافت نشد." });
    }

    if (user.status && user.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "🚫 حساب کاربری غیرفعال است." });
    }

    const roles =
      user.roles?.map((r) => (typeof r === "object" ? r.name : r)) || [];
    const permissions =
      user.roles?.flatMap((r) =>
        typeof r === "object" ? r.permissions || [] : []
      ) || [];

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles,
      permissions,
      isSuperAdmin: user.isSuperAdmin || roles.includes("superadmin"),
      status: user.status || "active",
    };

    req.clientInfo = getClientInfo(req);
    req.authContext = {
      user: req.user,
      clientInfo: req.clientInfo,
      permissions,
    };

    next();
  } catch (err) {
    console.error("❌ [protect] error:", err.message);
    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "⌛ توکن منقضی شده است."
          : "❌ توکن نامعتبر است.",
    });
  }
};

/**
 * 🔐 فقط برای مدیران (admin / superadmin)
 */
export const adminOnly = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: "کاربر احراز هویت نشده است." });

  const isAdmin =
    req.user.isSuperAdmin ||
    req.user.roles?.some((r) =>
      ["admin", "superadmin", "مدیر", "ادمین"].includes(
        r?.toLowerCase?.() || ""
      )
    );

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "🚫 فقط مدیران به این بخش دسترسی دارند.",
    });
  }

  next();
};

/**
 * 🎯 بررسی نقش خاص
 * - در صورت داشتن یکی از نقش‌های مجاز یا سوپرادمین اجازه می‌دهد
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "کاربر احراز هویت نشده است." });

    const hasRole =
      req.user.isSuperAdmin ||
      req.user.roles?.some((r) =>
        allowedRoles.map((x) => x.toLowerCase()).includes(r.toLowerCase())
      );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `🚫 دسترسی فقط برای نقش‌های ${allowedRoles.join(", ")} مجاز است.`,
      });
    }

    next();
  };
};

/**
 * 🧾 بررسی مجوز خاص (permission)
 * مخصوص سیستم‌هایی با دسترسی سطح مجوز
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "کاربر احراز هویت نشده است." });

    const hasPermission =
      req.user.isSuperAdmin ||
      (req.user.permissions || []).includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `🚫 مجوز '${requiredPermission}' برای انجام این عملیات لازم است.`,
      });
    }

    next();
  };
};
