// middleware/clientInfoMiddleware.js
import useragent from "useragent";
import crypto from "crypto";

/**
 * 🌍 Middleware: استخراج و استانداردسازی اطلاعات کلاینت
 * ---------------------------------------------------------
 * ✅ تشخیص IP واقعی حتی در Proxy/CDN
 * ✅ شناسایی مرورگر، سیستم عامل و دستگاه
 * ✅ افزودن clientId و traceId برای audit و ردیابی
 */
export const clientInfoMiddleware = (req, res, next) => {
  try {
    // 🔍 استخراج IP واقعی
    let ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "unknown";

    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
    if (ip === "::1") ip = "127.0.0.1";

    // 🧠 پردازش User-Agent
    const rawAgent = req.headers["user-agent"] || "unknown";
    const parsed = useragent.parse(rawAgent);
    const userAgent = {
      raw: rawAgent.length > 250 ? rawAgent.slice(0, 250) + "..." : rawAgent,
      browser: parsed?.toAgent?.() || "unknown",
      os: parsed?.os?.toString?.() || "unknown",
      device: parsed?.device?.toString?.() || "unknown",
    };

    // 🌐 منطقه جغرافیایی (اختیاری)
    const region =
      req.headers["cf-ipcountry"] ||
      req.headers["x-vercel-ip-country"] ||
      req.headers["x-country-code"] ||
      null;

    // 🧬 clientId یکتا بر اساس IP و Agent
    const clientId = crypto
      .createHash("sha256")
      .update(`${ip}-${rawAgent}`)
      .digest("hex")
      .slice(0, 16);

    // 🕓 متادیتا برای ردیابی
    const meta = {
      method: req.method,
      url: req.originalUrl,
      hostname: req.hostname,
      protocol: req.protocol,
      httpVersion: req.httpVersion,
      referrer: req.headers.referer || req.headers.referrer || null,
      timestamp: new Date().toISOString(),
    };

    // 📦 افزودن به request
    req.clientInfo = { ip, userAgent, region, clientId, meta };

    // 🔑 افزودن به authContext در صورت وجود
    req.authContext = req.authContext || {};
    req.authContext.clientInfo = req.clientInfo;

    if (req.sessionID || req.headers["x-session-id"]) {
      req.authContext.sessionId = req.sessionID || req.headers["x-session-id"];
    }

    // 🧾 شناسه ردیابی (traceId)
    req.traceId = req.traceId || crypto.randomUUID();

    // 💬 Log در محیط توسعه
    if (
      process.env.NODE_ENV === "development" &&
      !req.originalUrl.startsWith("/static")
    ) {
      console.log(
        `🌐 [ClientInfo] ${req.method} ${req.originalUrl} | IP: ${ip} | ${userAgent.browser} | Trace: ${req.traceId}`
      );
    }

    next();
  } catch (err) {
    console.error("❌ [clientInfoMiddleware] Error:", err.message);

    req.clientInfo = {
      ip: "unknown",
      userAgent: { raw: "unknown", browser: "unknown", os: "unknown", device: "unknown" },
      region: null,
      clientId: "unknown",
      meta: { method: req.method, url: req.originalUrl },
    };

    next();
  }
};
