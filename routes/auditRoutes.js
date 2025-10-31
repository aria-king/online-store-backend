//auditRoutes.js
import express from "express";
import AuditLog from "../models/AuditLog.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import ExcelJS from "exceljs";

const router = express.Router();

/**
 * ðŸ“Œ Ù„ÛŒØ³Øª Ù„Ø§Ú¯â€ŒÙ‡Ø§ (Ø¨Ø§ ÙÛŒÙ„ØªØ± + pagination)
 */
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { pageNum = parseInt(page, 10) || 1, limitNum = parseInt(limit, 10) || 20, entityType, action, changedBy, q } = req.query;
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (changedBy) filter.changedBy = changedBy;

    if (q) {
  const regex = new RegExp(q, "i");
  filter.$or = [
    { notes: regex },
    { entityType: regex },
    { action: regex },
    { "meta.details": regex },
  ];
}


    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate("changedBy", "name email");

    const total = await AuditLog.countDocuments(filter);

    res.json({
      results: logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("âŒ getAuditLogs error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù„Ø§Ú¯â€ŒÙ‡Ø§" });
  }
});

/**
 * ðŸ“Œ Ø®Ø±ÙˆØ¬ÛŒ Excel Ø§Ø² Ù„Ø§Ú¯â€ŒÙ‡Ø§
 */
router.get("/export", protect, adminOnly, async (req, res) => {
  try {
    const { entityType, action, changedBy, q } = req.query;

    let filter = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (changedBy) filter.changedBy = changedBy;

    if (q) {
      filter.$or = [
        { notes: new RegExp(q, "i") },
        { "meta.details": new RegExp(q, "i") },
      ];
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).populate("changedBy", "name email");

    // Ø³Ø§Ø®Øª ÙØ§ÛŒÙ„ Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Audit Logs");

    worksheet.columns = [
      { header: "ØªØ§Ø±ÛŒØ®", key: "createdAt", width: 20 },
      { header: "Ù…Ø¯Ù„", key: "entityType", width: 15 },
      { header: "EntityId", key: "entityId", width: 30 },
      { header: "Ø¹Ù…Ù„ÛŒØ§Øª", key: "action", width: 15 },
      { header: "Ú©Ø§Ø±Ø¨Ø± ØªØºÛŒÛŒØ±â€ŒØ¯Ù‡Ù†Ø¯Ù‡", key: "changedBy", width: 25 },
      { header: "IP", key: "ip", width: 20 },
      { header: "UserAgent", key: "userAgent", width: 40 },
      { header: "ÛŒØ§Ø¯Ø¯Ø§Ø´Øª", key: "notes", width: 50 },
      { header: "Meta", key: "meta", width: 50 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        createdAt: log.createdAt.toISOString(),
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        changedBy: log.changedBy ? `${log.changedBy.name} (${log.changedBy.email})` : "-",
        ip: log.ip || "-",
        userAgent: log.userAgent || "-",
        notes: log.notes || "",
        meta: log.meta ? JSON.stringify(log.meta) : "",
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=audit_logs.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("âŒ exportAuditLogs error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø®Ø±ÙˆØ¬ÛŒ Ú¯Ø±ÙØªÙ† Ù„Ø§Ú¯â€ŒÙ‡Ø§" });
  }
});

export default router;

