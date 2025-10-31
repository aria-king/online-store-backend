import Announcement from "../models/announcementModel.js";
import { logAudit } from "../services/auditService.js";
import { broadcastAnnouncement } from "../services/announcementSocketService.js";

// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ø§Ø¹Ù„Ø§Ù†
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await logAudit({
      entityType: "Announcement",
      entityId: announcement._id,
      action: "create",
      changedBy: req.user._id,
      notes: `Ø§ÛŒØ¬Ø§Ø¯ Ø§Ø¹Ù„Ø§Ù† Ø¬Ø¯ÛŒØ¯: ${announcement.title}`,
    });

 // ðŸ“¡ Ø§Ø±Ø³Ø§Ù„ Ø¨Ù„Ø§Ø¯Ø±Ù†Ú¯
    broadcastAnnouncement(announcement);

    res.status(201).json({ message: "Ø§Ø¹Ù„Ø§Ù† Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯", announcement });
  } catch (err) {
    console.error("âŒ createAnnouncement error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ø§Ø¹Ù„Ø§Ù†" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§
export const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }],
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª ÛŒÚ© Ø§Ø¹Ù„Ø§Ù† Ø®Ø§Øµ
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø§Ø¹Ù„Ø§Ù†" });
  }
};

// ðŸ“Œ ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø¹Ù„Ø§Ù†
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const oldData = announcement.toObject();
    Object.assign(announcement, req.body);
    await announcement.save();

    await logAudit({
      entityType: "Announcement",
      entityId: announcement._id,
      action: "update",
      changedBy: req.user._id,
      from: oldData,
      to: announcement,
      notes: `ÙˆÛŒØ±Ø§ÛŒØ´ Ø§Ø¹Ù„Ø§Ù†: ${announcement.title}`,
    });

    res.json({ message: "Ø§Ø¹Ù„Ø§Ù† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯", announcement });
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø§Ø¹Ù„Ø§Ù†" });
  }
};

// ðŸ“Œ Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    await Announcement.findByIdAndDelete(req.params.id);

    await logAudit({
      entityType: "Announcement",
      entityId: req.params.id,
      action: "delete",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†: ${announcement.title}`,
    });

    res.json({ message: "Ø§Ø¹Ù„Ø§Ù† Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†" });
  }
};
