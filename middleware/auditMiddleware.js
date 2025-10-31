// middleware/auditMiddleware.js
import { logAudit } from "../services/auditService.js";
import onFinished from "on-finished";
import crypto from "crypto";

/**
 * 🧩 Middleware: ثبت خودکار و امن Audit Trail
 * -------------------------------------------------
 * @param {string} entityType - نوع موجودیت (مثلاً "User" یا "Role")
 * @param {string} action - نوع عملیات (create/update/delete/...)
 * @param {Function|null} extractDataFn - تابع اختیاری برای مقایسه before/after
 */
export const auditMiddleware = (
  entityType = "Unknown",
  action = "unknown",
  extractDataFn = null
) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    req.startTime = Date.now();
    req.traceId = req.traceId || crypto.randomUUID();

    // جلوگیری از ثبت دوباره در صورت اجرای چندباره middleware
    if (req._auditHookInstalled) return next();
    req._auditHookInstalled = true;

    // 🧩 جایگزینی res.json برای ثبت Audit بعد از اتمام پاسخ
    res.json = function (body) {
      onFinished(res, async () => {
        try {
          if (req._auditLogged) return; // فقط یک‌بار ثبت شود
          req._auditLogged = true;

          // 🌐 اطلاعات IP و Agent
          let ip =
            req.clientInfo?.ip ||
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.ip ||
            req.socket?.remoteAddress ||
            "unknown";

          if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
          if (ip === "::1") ip = "127.0.0.1";

          const userAgent =
            req.clientInfo?.userAgent?.raw ||
            req.headers["user-agent"] ||
            "unknown";

          // 🧱 تشخیص شناسه موجودیت
          const entityId =
            body?._id ||
            body?.id ||
            req.params?.id ||
            req.params?.userId ||
            req.params?.roleId ||
            req.params?.ticketId ||
            null;

          // 🔍 استخراج تغییرات (اختیاری)
          let from = null,
            to = null;
          if (typeof extractDataFn === "function") {
            try {
              const diff = await extractDataFn(req, body);
              from = diff?.from || null;
              to = diff?.to || null;
            } catch (err) {
              console.warn("[auditMiddleware] Diff extraction failed:", err.message);
            }
          }

          // 👤 اطلاعات کاربر
          const user = req.user || req.authContext?.user || {};
          const userId = user._id || user.id || null;
          const userRoles = Array.isArray(user.roles)
            ? user.roles
                .map((r) => (typeof r === "object" && r._id ? r._id : r))
                .filter(Boolean)
            : [];

          // 🧭 متادیتا
          const meta = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - req.startTime,
            env: process.env.NODE_ENV,
            traceId: req.traceId,
            client: {
              ip,
              userAgent,
              region: req.clientInfo?.region || null,
            },
          };

          // 🪶 ذخیره در Audit Log
          await logAudit({
            entityType,
            entityId,
            action,
            changedBy: userId,
            activeRoles: userRoles,
            authContext: req.authContext || {},
            from,
            to,
            notes: req.body?.notes || "",
            ip,
            userAgent,
            meta,
          });

          // 📜 Log توسعه‌دهنده در حالت development
          if (process.env.NODE_ENV === "development") {
            console.log(
              `🧾 [AUDIT:${action}] ${entityType} | user: ${
                user?.email || "unknown"
              } | IP: ${ip} | ⏱ ${meta.durationMs}ms | Trace: ${req.traceId}`
            );
          }
        } catch (err) {
          console.error("❌ [auditMiddleware] Error:", err.message);
        }
      });

      return originalJson(body);
    };

    next();
  };
};
