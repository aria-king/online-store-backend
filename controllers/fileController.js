import File from "../models/fileModel.js";
import { deleteFileFromDisk } from "../services/fileService.js";
import { logAudit } from "../services/auditService.js";
import path from "path";
import mongoose from "mongoose";

// ðŸ“¤ Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "ÙØ§ÛŒÙ„ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª" });

    const { relatedEntityType, relatedEntityId, meta } = req.body;

    if (!relatedEntityType || !relatedEntityId) {
      return res.status(400).json({ message: "Ù…ÙˆØ¬ÙˆØ¯ÛŒØª Ù…Ø±ØªØ¨Ø· Ù…Ø´Ø®Øµ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª" });
    }

    if (!mongoose.Types.ObjectId.isValid(relatedEntityId)) {
      return res.status(400).json({ message: "Ø´Ù†Ø§Ø³Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒØª Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª" });
    }

    const file = await File.create({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      relatedEntityType,
      relatedEntityId,
      meta: meta ? JSON.parse(meta) : {},
    });

    await logAudit({
      entityType: "File",
      entityId: file._id,
      action: "upload",
      changedBy: req.user._id,
      notes: `Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ Ø¨Ø±Ø§ÛŒ ${relatedEntityType}: ${file.fileName}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { relatedEntityType, relatedEntityId },
    });

    res.status(201).json({
      message: "ÙØ§ÛŒÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¢Ù¾Ù„ÙˆØ¯ Ø´Ø¯",
      file,
    });
  } catch (err) {
    console.error("âŒ uploadFile error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„" });
  }
};

// ðŸ“¥ Ø¯Ø±ÛŒØ§ÙØª ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
export const getFiles = async (req, res) => {
  try {
    const { relatedEntityType, relatedEntityId } = req.query;

    const filter = {};
    if (relatedEntityType) filter.relatedEntityType = relatedEntityType;
    if (relatedEntityId) filter.relatedEntityId = relatedEntityId;

    const files = await File.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ total: files.length, files });
  } catch (err) {
    console.error("âŒ getFiles error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ÙØ§ÛŒÙ„â€ŒÙ‡Ø§" });
  }
};

// âŒ Ø­Ø°Ù ÙØ§ÛŒÙ„
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "ÙØ§ÛŒÙ„ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const absolutePath = path.join(process.cwd(), file.fileUrl.replace("/uploads", "uploads"));
    deleteFileFromDisk(absolutePath);

    await file.deleteOne();

    await logAudit({
      entityType: "File",
      entityId: file._id,
      action: "delete",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù ÙØ§ÛŒÙ„: ${file.fileName}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { relatedEntityType: file.relatedEntityType, relatedEntityId: file.relatedEntityId },
    });

    res.json({ message: "ÙØ§ÛŒÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteFile error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ÙØ§ÛŒÙ„" });
  }
};
