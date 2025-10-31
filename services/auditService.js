import mongoose from "mongoose";
import crypto from "crypto";
import AuditLog from "../models/AuditLog.js";

/**
 * ðŸ§¾ logAudit â€” Ø«Ø¨Øª Ø¯Ù‚ÛŒÙ‚ Ùˆ Ø§Ù…Ù† ÙØ¹Ø§Ù„ÛŒØªâ€ŒÙ‡Ø§
 * --------------------------------------
 * - Ù‡Ù…Ø§Ù‡Ù†Ú¯ Ø¨Ø§: authMiddleware, auditMiddleware, clientInfoMiddleware
 * - Ø­Ø°Ù Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ Ø­Ø³Ø§Ø³ (password, token, key, secret)
 * - Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² crash Ø¯Ø± BSON/Circular
 * - Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø§Ø² queue (Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯ global.auditQueue)
 */
export const logAudit = async ({
  entityType,
  entityId,
  action,
  changedBy = null,
  activeRoles = [],
  authContext = {},
  from = null,
  to = null,
  notes = "",
  ip = "unknown",
  userAgent = "unknown",
  meta = {},
}) => {
  try {
    if (!entityType || !action) {
      console.warn("âš ï¸ [logAudit] entityType ÛŒØ§ action Ø®Ø§Ù„ÛŒ Ø§Ø³Øª.");
      entityType = entityType || "Unknown";
      action = action || "unknown";
    }

    // ðŸ§© Ø§Ø¨Ø²Ø§Ø± Ú©Ù…Ú©ÛŒ Ø¨Ø±Ø§ÛŒ Ø³Ø§Ø®Øª ObjectId Ø§Ù…Ù†
    const toObjectId = (val) => {
      if (!val) return null;
      try {
        return mongoose.isValidObjectId(val) ? new mongoose.Types.ObjectId(val) : null;
      } catch {
        return null;
      }
    };

    const validEntityId = toObjectId(entityId);
    const validChangedBy = toObjectId(changedBy);

    // ðŸŽ­ Ù†Ù‚Ø´â€ŒÙ‡Ø§
    const validRoles = Array.isArray(activeRoles)
      ? activeRoles.map(toObjectId).filter(Boolean)
      : [];

    const finalIp =
      ip ||
      meta?.clientInfo?.ip ||
      authContext?.clientInfo?.ip ||
      "unknown";

    const finalUserAgent =
      userAgent ||
      meta?.clientInfo?.userAgent ||
      authContext?.clientInfo?.userAgent ||
      "unknown";

    // ðŸ§  authContext ØªØ±Ú©ÛŒØ¨ÛŒ
    const authMeta = {
      userId: toObjectId(authContext?.userId || changedBy),
      roles: Array.isArray(authContext?.roles)
        ? authContext.roles.map(toObjectId).filter(Boolean)
        : validRoles,
      permissions: Array.isArray(authContext?.permissions)
        ? [...new Set(authContext.permissions)]
        : [],
      verified: Boolean(authContext?.verified),
      isSuperAdmin: !!authContext?.isSuperAdmin,
      sessionId: authContext?.sessionId || meta?.sessionId || null,
    };

    /**
     * ðŸ§¹ Sanitize - Ø­Ø°Ù Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ Ø®Ø·Ø±Ù†Ø§Ú© / Ø³Ù†Ú¯ÛŒÙ†
     */
    const seen = new WeakSet();
    const sanitize = (val, depth = 0) => {
      if (depth > 6) return "[DepthLimit]";
      if (val === null || val === undefined) return null;
      if (typeof val === "function" || typeof val === "symbol") return `[${typeof val}]`;
      if (typeof val === "bigint") return val.toString();

      if (Array.isArray(val)) return val.map((v) => sanitize(v, depth + 1));

      if (typeof val === "object") {
        if (seen.has(val)) return "[CircularRef]";
        seen.add(val);
        const result = {};
        for (const [key, v] of Object.entries(val)) {
          if (/(password|token|secret|private|credential)/i.test(key)) {
            result[key] = "[REDACTED]";
          } else {
            result[key] = sanitize(v, depth + 1);
          }
        }
        return result;
      }

      return val;
    };

    // ðŸ§¾ Ø³Ø§Ø®Øª payload
    const payload = {
      entityType: String(entityType).trim(),
      entityId: validEntityId,
      action: String(action).trim(),
      changedBy: validChangedBy,
      activeRoles: validRoles,
      from: sanitize(from),
      to: sanitize(to),
      notes: typeof notes === "string" ? notes.trim() : sanitize(notes),
      ip: finalIp,
      userAgent: finalUserAgent,
      meta: sanitize({
        ...meta,
        clientInfo: { ip: finalIp, userAgent: finalUserAgent },
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      }),
      authContext: sanitize(authMeta),
      createdAt: new Date(),
    };

    // ðŸŽš Ø³Ø·Ø­ Ø§Ù‡Ù…ÛŒØª
    payload.meta.severity =
      ["delete", "permission_change"].includes(action)
        ? "critical"
        : ["update", "status_change"].includes(action)
        ? "warning"
        : ["login", "logout", "view"].includes(action)
        ? "info"
        : "normal";

    payload.meta.traceId = meta.traceId || crypto.randomUUID();

    // âš ï¸ Ú©Ù†ØªØ±Ù„ Ø§Ù†Ø¯Ø§Ø²Ù‡ BSON
    const size = Buffer.byteLength(JSON.stringify(payload), "utf8");
    if (size > 15 * 1024 * 1024) {
      payload.from = "[TRIMMED]";
      payload.to = "[TRIMMED]";
      payload.meta.warning = "Payload trimmed due to BSON size limit.";
      payload.meta.approxSize = `${(size / 1024 / 1024).toFixed(2)} MB`;
    }

    // ðŸ’¾ Ø°Ø®ÛŒØ±Ù‡ Ù†Ù‡Ø§ÛŒÛŒ
    let result = null;
    if (process.env.USE_AUDIT_QUEUE === "true" && global.auditQueue?.add) {
      await global.auditQueue.add("audit", payload);
    } else {
      result = await AuditLog.create(payload);
    }

    // ðŸ§© Ù„Ø§Ú¯ Ú©ÙˆØªØ§Ù‡ Ø¯Ø± Ø­Ø§Ù„Øª dev
    if (process.env.NODE_ENV !== "production") {
      const rid = payload.authContext.userId || "system";
      console.log(`ðŸ“‹ [AUDIT] ${action.toUpperCase()} ${entityType} by ${rid} @ ${finalIp}`);
    }

    return result;
  } catch (err) {
    console.error("âŒ [logAudit] Fatal error:", err);
    return null;
  }
};

/**
 * ðŸ§  deepDiff â€” Ù…Ù‚Ø§ÛŒØ³Ù‡Ù” Ø¹Ù…ÛŒÙ‚ before/after
 */
export const deepDiff = (a = {}, b = {}, path = "") => {
  const changes = {};
  for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const fullPath = path ? `${path}.${key}` : key;
    const valA = a[key];
    const valB = b[key];
    if (
      typeof valA === "object" &&
      valA !== null &&
      typeof valB === "object" &&
      valB !== null
    ) {
      Object.assign(changes, deepDiff(valA, valB, fullPath));
    } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
      changes[fullPath] = { from: valA, to: valB };
    }
  }
  return changes;
};
