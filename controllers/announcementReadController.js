import AnnouncementRead from "../models/announcementReadModel.js";
import Announcement from "../models/announcementModel.js";
import { logAudit } from "../services/auditService.js";

// ðŸ“Œ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
export const markAsRead = async (req, res) => {
  try {
    const { announcementId } = req.body;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement)
      return res.status(404).json({ message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    await AnnouncementRead.updateOne(
      { user: req.user._id, announcement: announcementId },
      { $set: { readAt: new Date() } },
      { upsert: true }
    );

    await logAudit({
      entityType: "Announcement",
      entityId: announcementId,
      action: "read",
      changedBy: req.user._id,
      notes: `Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø§Ø¹Ù„Ø§Ù†: ${announcement.title}`,
    });

    res.json({ message: "Ø§Ø¹Ù„Ø§Ù† Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ markAsRead error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø§Ø¹Ù„Ø§Ù†" });
  }
};

// ðŸ“Œ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
export const markAllAsRead = async (req, res) => {
  try {
    const unreadAnnouncements = await Announcement.find({ isActive: true });
    const bulk = unreadAnnouncements.map((a) => ({
      updateOne: {
        filter: { user: req.user._id, announcement: a._id },
        update: { $set: { readAt: new Date() } },
        upsert: true,
      },
    }));

    if (bulk.length > 0) {
      await AnnouncementRead.bulkWrite(bulk);
    }

    await logAudit({
      entityType: "Announcement",
      entityId: null,
      action: "read_all",
      changedBy: req.user._id,
      notes: "Ø®ÙˆØ§Ù†Ø¯Ù† ØªÙ…Ø§Ù… Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§",
    });

    res.json({ message: "ØªÙ…Ø§Ù… Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù†Ø¯" });
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø®ÙˆØ§Ù†Ø¯Ù† ØªÙ…Ø§Ù… Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};

// ðŸ“Œ Ø´Ù…Ø§Ø±Ø´ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒÙ†Ø´Ø¯Ù‡
export const getUnreadCount = async (req, res) => {
  try {
    const all = await Announcement.find({ isActive: true });
    const read = await AnnouncementRead.find({
      user: req.user._id,
    }).distinct("announcement");

    const unreadCount = all.filter(
      (a) => !read.includes(a._id.toString())
    ).length;

    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø´Ù…Ø§Ø± Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒÙ†Ø´Ø¯Ù‡" });
  }
};
