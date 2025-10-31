// middleware/permissionMiddleware.js

/**
 * 🧩 Middleware: بررسی مجوزهای دسترسی کاربر
 * ------------------------------------------------------
 * ✅ پشتیبانی از wildcard ("*", "resource:*", "*:action")
 * ✅ هماهنگی با authContext و clientInfo
 * ✅ ثبت گزارش ساختاریافته برای سیستم AuditTrail
 */

export const checkPermission = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const user = req.user || req.authContext?.user;

      if (!user || typeof user !== "object") {
        return res.status(401).json({
          success: false,
          message: "⚠️ ابتدا وارد حساب کاربری خود شوید.",
        });
      }

      // 🔐 جمع‌آوری تمام مجوزها از نقش‌ها و خود کاربر
      const userPermissions = new Set(
        Array.isArray(user.permissions) ? user.permissions : []
      );

      if (Array.isArray(user.roles)) {
        user.roles.forEach((role) => {
          if (Array.isArray(role?.permissions)) {
            role.permissions.forEach((perm) => userPermissions.add(perm));
          }
        });
      }

      // 👑 بررسی SuperAdmin
      const isSuperAdmin =
        user.isSuperAdmin ||
        user.roles?.some((r) =>
          ["superadmin", "مدیر کل", "ادمین کل"].includes(
            r?.name?.trim()?.toLowerCase?.()
          )
        );

      if (isSuperAdmin) {
        req.authContext = req.authContext || {};
        req.authContext.permissionCheck = {
          bypass: true,
          reason: "SuperAdmin bypass",
          timestamp: new Date().toISOString(),
          ip: req.clientInfo?.ip || req.ip || "unknown",
        };
        return next();
      }

      // 🎯 تبدیل ورودی به آرایه استاندارد
      const needed = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // 🔍 بررسی دسترسی با پشتیبانی از wildcard
      const hasAccess =
        needed.length === 0 ||
        needed.some((required) => {
          if (userPermissions.has(required)) return true;

          const [resource, action] = required.split(":");
          return (
            userPermissions.has(`${resource}:*`) || // دسترسی برای تمام اکشن‌های یک منبع
            userPermissions.has(`*:${action}`) || // دسترسی برای اکشن خاص در همه منابع
            userPermissions.has("*") // دسترسی کلی
          );
        });

      // 🚫 اگر دسترسی ندارد
      if (!hasAccess) {
        req.authContext = req.authContext || {};
        req.authContext.permissionCheck = {
          required: needed,
          granted: [...userPermissions],
          hasAccess: false,
          timestamp: new Date().toISOString(),
          ip: req.clientInfo?.ip || req.ip || "unknown",
          userAgent: req.clientInfo?.userAgent || req.headers["user-agent"],
        };

        return res.status(403).json({
          success: false,
          message:
            "🚫 شما دسترسی لازم برای انجام این عملیات را ندارید.",
          requiredPermissions: needed,
          userPermissions: [...userPermissions],
          userRoles:
            user.roles?.map((r) =>
              typeof r === "object" ? r.name : r
            ) || [],
        });
      }

      // ✅ اگر مجاز است
      req.authContext = req.authContext || {};
      req.authContext.permissionCheck = {
        required: needed,
        granted: [...userPermissions],
        hasAccess: true,
        timestamp: new Date().toISOString(),
        ip: req.clientInfo?.ip || req.ip || "unknown",
        userAgent: req.clientInfo?.userAgent || req.headers["user-agent"],
      };

      next();
    } catch (err) {
      console.error("❌ [checkPermission] Internal Error:", err);
      res.status(500).json({
        success: false,
        message: "⚠️ خطا در بررسی سطح دسترسی کاربر.",
      });
    }
  };
};
