// controllers/auditLogController.js
import AuditLog from "../models/AuditLog.js";
import mongoose from "mongoose";
import { logAudit } from "../services/auditService.js";

/**
 * ðŸ“‹ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ù„Ø§Ú¯â€ŒÙ‡Ø§ Ø¨Ø§ ÙÛŒÙ„ØªØ±ØŒ Ø¬Ø³ØªØ¬ÙˆØŒ ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒ Ùˆ Ù…Ø±ØªØ¨â€ŒØ³Ø§Ø²ÛŒ
 * Ø¯Ø³ØªØ±Ø³ÛŒ: ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ Ú©Ø§Ø±Ø¨Ø± Ø¯Ø§Ø±Ø§ÛŒ Ù…Ø¬ÙˆØ² "audit:read"
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      entityType,
      action,
      changedBy,
      search,
      startDate,
      endDate,
      sort = "-createdAt",
      severity,
      userId,
      roleId,
      traceId,
    } = req.query;

    const filter = {};

    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (severity) filter.severity = severity;

    if (changedBy && mongoose.Types.ObjectId.isValid(changedBy))
      filter.changedBy = changedBy;

    if (userId && mongoose.Types.ObjectId.isValid(userId))
      filter["authContext.userId"] = userId;

    if (roleId && mongoose.Types.ObjectId.isValid(roleId))
      filter["authContext.roles"] = roleId;

    if (traceId) filter["meta.traceId"] = traceId;

    // ðŸ” Ø¬Ø³ØªØ¬ÙˆÛŒ Ú†Ù†Ø¯Ú¯Ø§Ù†Ù‡
    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { entityType: regex },
        { action: regex },
        { notes: regex },
        { ip: regex },
        { "meta.clientInfo.userAgent": regex },
        { "meta.url": regex },
        { "authContext.permissions": regex },
      ];
    }

    // ðŸ“… Ø¨Ø§Ø²Ù‡ Ø²Ù…Ø§Ù†ÛŒ
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter, {
        entityType: 1,
        action: 1,
        severity: 1,
        changedBy: 1,
        authContext: 1,
        activeRoles: 1,
        notes: 1,
        ip: 1,
        createdAt: 1,
        meta: 1,
      })
        .populate("changedBy", "name lastName email roles")
        .populate("activeRoles", "name")
        .populate("authContext.userId", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "âœ… Ù„ÛŒØ³Øª Ù„Ø§Ú¯â€ŒÙ‡Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯.",
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
      data: logs,
    });
  } catch (err) {
    console.error("âŒ [getAuditLogs] error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù„Ø§Ú¯â€ŒÙ‡Ø§" });
  }
};

/**
 * ðŸ” Ø¯Ø±ÛŒØ§ÙØª Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ù„Ø§Ú¯ Ø®Ø§Øµ
 */
export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate("changedBy", "name lastName email roles")
      .populate("activeRoles", "name")
      .populate("authContext.userId", "name email");

    if (!log)
      return res.status(404).json({ success: false, message: "Ù„Ø§Ú¯ ÛŒØ§ÙØª Ù†Ø´Ø¯." });

    res.json({
      success: true,
      message: "âœ… Ø¬Ø²Ø¦ÛŒØ§Øª Ù„Ø§Ú¯ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¯Ø±ÛŒØ§ÙØª Ø´Ø¯.",
      data: log,
    });
  } catch (err) {
    console.error("âŒ [getAuditLogById] error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù„Ø§Ú¯." });
  }
};

/**
 * ðŸ§¹ Ø­Ø°Ù Ù‡Ù…Ù‡ Ù„Ø§Ú¯â€ŒÙ‡Ø§ â€” ÙÙ‚Ø· SuperAdmin
 */
export const clearAuditLogs = async (req, res) => {
  try {
    const user = req.user || req.authContext?.user;
    const clientInfo = req.clientInfo || req.authContext?.clientInfo;

    if (!user?.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "â›” ÙÙ‚Ø· SuperAdmin Ù…Ø¬Ø§Ø² Ø¨Ù‡ Ø­Ø°Ù Ù‡Ù…Ù‡ Ù„Ø§Ú¯â€ŒÙ‡Ø§ Ø§Ø³Øª.",
      });
    }

    const totalDeleted = await AuditLog.countDocuments();
    await AuditLog.deleteMany({});

    // Ø«Ø¨Øª Ø¹Ù…Ù„ÛŒØ§Øª Ø¯Ø± Ù„Ø§Ú¯
    await logAudit({
      entityType: "AuditLog",
      action: "delete",
      changedBy: user._id,
      severity: "critical",
      notes: `SuperAdmin ØªÙ…Ø§Ù… Ù„Ø§Ú¯â€ŒÙ‡Ø§ (${totalDeleted} Ø±Ú©ÙˆØ±Ø¯) Ø±Ø§ Ø­Ø°Ù Ú©Ø±Ø¯.`,
      ip: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      meta: {
        totalDeleted,
        traceId: crypto.randomUUID(),
        env: process.env.NODE_ENV,
      },
    });

    res.json({
      success: true,
      message: `ðŸ—‘ï¸ ${totalDeleted} Ù„Ø§Ú¯ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯Ù†Ø¯.`,
    });
  } catch (err) {
    console.error("âŒ [clearAuditLogs] error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù„Ø§Ú¯â€ŒÙ‡Ø§" });
  }
};
