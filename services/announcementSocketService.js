// services/announcementSocketService.js
import { getIO } from "../services/socket.js";
import { createNotification } from "./notificationService.js";
import User from "../models/userModel.js";

/**
 * ðŸ“¢ Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ø¨Ù„Ø§Ø¯Ø±Ù†Ú¯ Ù‡Ù†Ú¯Ø§Ù… Ø§ÛŒØ¬Ø§Ø¯ Announcement
 * @param {Object} announcement - Ø´ÛŒØ¡ Ø§Ø¹Ù„Ø§Ù†
 */
export const broadcastAnnouncement = async (announcement) => {
  const io = getIO();
  if (!io) return console.warn("âš ï¸ Socket.io Ù‡Ù†ÙˆØ² Ù…Ù‚Ø¯Ø§Ø±Ø¯Ù‡ÛŒ Ù†Ø´Ø¯Ù‡.");

  try {
    let targetUsers = [];

    // ðŸŽ¯ Ù…Ø´Ø®Øµ Ú©Ø±Ø¯Ù† Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù‡Ø¯Ù
    if (announcement.target === "all") {
      targetUsers = await User.find({}, "_id");
    } else if (announcement.target === "role") {
      targetUsers = await User.find({ role: { $in: announcement.roles } }, "_id");
    } else if (announcement.target === "users") {
      targetUsers = announcement.users.map((u) => ({ _id: u }));
    }

    // âœ‰ï¸ Ø§Ø±Ø³Ø§Ù„ Ø¨Ù‡ Ù‡Ø± Ú©Ø§Ø±Ø¨Ø±
    for (const user of targetUsers) {
      // Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø± Ø¬Ø¯ÙˆÙ„ Notification
      await createNotification(
        user._id,
        "system",
        announcement.title,
        { announcementId: announcement._id }
      );

      // Ø§Ø±Ø³Ø§Ù„ Ø¨Ù„Ø§Ø¯Ø±Ù†Ú¯ Ø§Ø² Ø·Ø±ÛŒÙ‚ Socket.io
      io.to(user._id.toString()).emit("newAnnouncement", {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        createdAt: announcement.createdAt,
      });
    }

    console.log(`ðŸ“¢ Ø§Ø¹Ù„Ø§Ù† "${announcement.title}" Ø¨Ø±Ø§ÛŒ ${targetUsers.length} Ú©Ø§Ø±Ø¨Ø± Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯.`);
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± broadcastAnnouncement:", err);
  }
};
