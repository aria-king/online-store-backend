// controllers/notificationController.js
import Notification from "../models/notificationModel.js";
import { logAudit } from "../services/auditService.js";

/* ===========================================================
   ðŸ“‹ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±
=========================================================== */
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments({ user: req.user._id }),
    ]);

    // ðŸ” Ø«Ø¨Øª Ø¯Ø± Ù„Ø§Ú¯
    await logAudit({
      entityType: "Notification",
      entityId: req.user._id,
      action: "read_list",
      changedBy: req.user._id,
      notes: "ðŸ“‹ Ú©Ø§Ø±Ø¨Ø± Ù„ÛŒØ³Øª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ¯ Ø±Ø§ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ú©Ø±Ø¯",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { count: notifications.length, page, total },
    });

    res.json({
      success: true,
      total,
      page: parseInt(page),
      data: notifications,
    });
  } catch (err) {
    console.error("âŒ [getUserNotifications] Error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};

/* ===========================================================
   âœ… Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ ÛŒÚ© Ø§Ø¹Ù„Ø§Ù† Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
=========================================================== */
export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification)
      return res.status(404).json({ success: false, message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (notification.isRead)
      return res.json({ success: true, message: "Ù¾ÛŒØ´â€ŒØªØ± Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù‡ Ø¨ÙˆØ¯" });

    const oldData = { isRead: notification.isRead };
    notification.isRead = true;
    const updated = await notification.save();

    await logAudit({
      entityType: "Notification",
      entityId: updated._id,
      action: "mark_read",
      changedBy: req.user._id,
      from: oldData,
      to: { isRead: true },
      notes: "ðŸ“© Ø§Ø¹Ù„Ø§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { notificationId: updated._id },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("âŒ [readNotification] Error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø§Ø¹Ù„Ø§Ù†" });
  }
};

/* ===========================================================
   âœ… Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
=========================================================== */
export const readAllNotifications = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    await logAudit({
      entityType: "Notification",
      entityId: req.user._id,
      action: "mark_all_read",
      changedBy: req.user._id,
      notes: "ðŸ“¨ Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù†Ø¯",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { modifiedCount: result.modifiedCount },
    });

    res.json({ success: true, message: "Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù†Ø¯" });
  } catch (err) {
    console.error("âŒ [readAllNotifications] Error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};

/* ===========================================================
   ðŸ—‘ Ø­Ø°Ù ÛŒÚ© Ø§Ø¹Ù„Ø§Ù†
=========================================================== */
export const removeNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification)
      return res.status(404).json({ success: false, message: "Ø§Ø¹Ù„Ø§Ù† ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const oldData = notification.toObject();
    await notification.deleteOne();

    await logAudit({
      entityType: "Notification",
      entityId: id,
      action: "delete",
      changedBy: req.user._id,
      from: oldData,
      to: null,
      notes: "ðŸ—‘ Ø§Ø¹Ù„Ø§Ù† Ø­Ø°Ù Ø´Ø¯",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { notificationId: id },
    });

    res.json({ success: true, message: "Ø§Ø¹Ù„Ø§Ù† Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ [removeNotification] Error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†" });
  }
};

/* ===========================================================
   ðŸ§¹ Ø­Ø°Ù Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§
=========================================================== */
export const clearNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });

    await logAudit({
      entityType: "Notification",
      entityId: req.user._id,
      action: "clear_all",
      changedBy: req.user._id,
      notes: "ðŸ§¹ Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø± Ø­Ø°Ù Ø´Ø¯Ù†Ø¯",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { deletedCount: result.deletedCount },
    });

    res.json({ success: true, message: "Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø­Ø°Ù Ø´Ø¯Ù†Ø¯" });
  } catch (err) {
    console.error("âŒ [clearNotifications] Error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};// ✅ آمار اعلان‌ها برای گزارش
export const getNotificationStats = async (req = null, res = null) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const readNotifications = totalNotifications - unreadNotifications;

    const stats = {
      totalNotifications,
      unreadNotifications,
      readNotifications,
    };

    if (res) return res.json(stats);
    return stats; // برای استفاده داخلی در reportController
  } catch (err) {
    console.error("❌ getNotificationStats error:", err);
    if (res)
      res.status(500).json({ message: "خطا در محاسبه آمار اعلان‌ها" });
    return null;
  }
};
