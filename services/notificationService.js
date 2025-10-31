// services/notificationService.js
import Notification from "../models/notificationModel.js";
import { getIO } from "./socket.js";
import { logAudit } from "../services/auditService.js";

/**
 * ðŸ“© Ø§ÛŒØ¬Ø§Ø¯ Ø§Ø¹Ù„Ø§Ù† Ø¬Ø¯ÛŒØ¯ Ø¨Ø±Ø§ÛŒ ÛŒÚ© Ú©Ø§Ø±Ø¨Ø±
 */
export const createNotification = async (userId, type, content, data = {}, context = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      content,
      data,
    });

    // ðŸ“¡ Ø§Ø±Ø³Ø§Ù„ Ø²Ù†Ø¯Ù‡ Ø¯Ø±ØµÙˆØ±Øª Ø¢Ù†Ù„Ø§ÛŒÙ† Ø¨ÙˆØ¯Ù†
    const io = getIO();
    if (io?.to) io.to(userId.toString()).emit("newNotification", notification);

    // ðŸ§¾ Ø«Ø¨Øª Ø¯Ø± Ù„Ø§Ú¯ Ø³ÛŒØ³ØªÙ…
    await logAudit({
      entityType: "Notification",
      entityId: notification._id,
      action: "create",
      changedBy: context?.user?._id || null,
      authContext: context,
      to: notification,
      notes: `Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ø¬Ø¯ÛŒØ¯ Ø¨Ù‡ Ú©Ø§Ø±Ø¨Ø± ${userId}`,
      meta: { type, content, userId },
    });

    return { success: true, data: notification };
  } catch (err) {
    console.error("âŒ [createNotification] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ø§Ø¹Ù„Ø§Ù†" };
  }
};

/**
 * ðŸ“¢ Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ú¯Ø±ÙˆÙ‡ÛŒ
 */
export const sendBulkNotifications = async (userIds, type, content, data = {}, context = {}) => {
  try {
    const notifications = userIds.map((id) => ({
      user: id,
      type,
      content,
      data,
    }));

    await Notification.insertMany(notifications);

    const io = getIO();
    if (io?.to) {
      for (const id of userIds) {
        io.to(id.toString()).emit("newNotification", { type, content, data });
      }
    }

    // ðŸ§¾ Ø«Ø¨Øª Ø¯Ø± Ù„Ø§Ú¯ Ø³ÛŒØ³ØªÙ…
    await logAudit({
      entityType: "Notification",
      action: "create",
      changedBy: context?.user?._id || null,
      authContext: context,
      notes: `Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ú¯Ø±ÙˆÙ‡ÛŒ (${notifications.length} Ú©Ø§Ø±Ø¨Ø±)`,
      meta: { type, content, total: notifications.length },
    });

    return { success: true, count: notifications.length };
  } catch (err) {
    console.error("âŒ [sendBulkNotifications] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ú¯Ø±ÙˆÙ‡ÛŒ" };
  }
};

/**
 * ðŸ“œ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø± (Ø¨Ø§ ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒ)
 */
export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: userId }),
    ]);

    return {
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notifications,
    };
  } catch (err) {
    console.error("âŒ [getUserNotifications] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" };
  }
};

/**
 * ðŸŸ¢ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø§Ø¹Ù„Ø§Ù† Ø®Ø§Øµ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
 */
export const markAsRead = async (notificationId, userId, context = {}) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (updated) {
      await logAudit({
        entityType: "Notification",
        entityId: notificationId,
        action: "update",
        changedBy: context?.user?._id || userId,
        authContext: context,
        notes: "Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø§Ø¹Ù„Ø§Ù† Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡",
      });
    }

    return { success: true, data: updated };
  } catch (err) {
    console.error("âŒ [markAsRead] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø§Ø¹Ù„Ø§Ù†" };
  }
};

/**
 * âœ… Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù† Ù‡Ù…Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ ÛŒÚ© Ú©Ø§Ø±Ø¨Ø±
 */
export const markNotificationsAsRead = async (userId, context = {}) => {
  try {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    await logAudit({
      entityType: "Notification",
      action: "update",
      changedBy: context?.user?._id || userId,
      authContext: context,
      notes: "ØªÙ…Ø§Ù… Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù†Ø¯.",
      meta: { modified: result.modifiedCount },
    });

    return { success: true, modified: result.modifiedCount };
  } catch (err) {
    console.error("âŒ [markNotificationsAsRead] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø®ÙˆØ§Ù†Ø¯Ù† Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" };
  }
};

/**
 * âŒ Ø­Ø°Ù ÛŒÚ© Ø§Ø¹Ù„Ø§Ù† Ø®Ø§Øµ
 */
export const deleteNotification = async (notificationId, userId, context = {}) => {
  try {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

    if (deleted) {
      await logAudit({
        entityType: "Notification",
        entityId: notificationId,
        action: "delete",
        changedBy: context?.user?._id || userId,
        authContext: context,
        notes: "Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù† Ú©Ø§Ø±Ø¨Ø±",
      });
    }

    return { success: true, deleted };
  } catch (err) {
    console.error("âŒ [deleteNotification] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø§Ø¹Ù„Ø§Ù†" };
  }
};

/**
 * ðŸ§¹ Ø­Ø°Ù ØªÙ…Ø§Ù… Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±
 */
export const clearUserNotifications = async (userId, context = {}) => {
  try {
    const count = await Notification.countDocuments({ user: userId });
    await Notification.deleteMany({ user: userId });

    await logAudit({
      entityType: "Notification",
      action: "delete",
      changedBy: context?.user?._id || userId,
      authContext: context,
      notes: `Ø­Ø°Ù ${count} Ø§Ø¹Ù„Ø§Ù† Ø¨Ø±Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±`,
      meta: { count },
    });

    return { success: true, deleted: count };
  } catch (err) {
    console.error("âŒ [clearUserNotifications] error:", err);
    return { success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ù¾Ø§Ú©â€ŒØ³Ø§Ø²ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" };
  }
};
