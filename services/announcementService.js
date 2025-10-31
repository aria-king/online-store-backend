// services/announcementService.js
import cron from "node-cron";
import Announcement from "../models/announcementModel.js";
import { getIO } from "./socket.js";
import { createNotification } from "./notificationService.js";
import User from "../models/userModel.js";

/**
 * ðŸ“… Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø±Ø±Ø³ÛŒ Ø§Ù†Ù‚Ø¶Ø§ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ (Ù‡Ø± Ø¯Ù‚ÛŒÙ‚Ù‡ ÛŒÚ©Ø¨Ø§Ø±)
 */
export const startAnnouncementScheduler = () => {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      // ÙÙ‚Ø· Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„ Ú©Ù‡ ØªØ§Ø±ÛŒØ® Ø§Ù†Ù‚Ø¶Ø§ Ø¯Ø§Ø±Ù†Ø¯
      const expiring = await Announcement.find({
        isActive: true,
        expiresAt: { $lte: now },
      });

      for (const announcement of expiring) {
        announcement.isActive = false;
        await announcement.save();

        console.log(`ðŸ•’ Ø§Ø¹Ù„Ø§Ù† "${announcement.title}" Ù…Ù†Ù‚Ø¶ÛŒ Ø´Ø¯.`);

        // ðŸŽ¯ Ù…Ø´Ø®Øµ Ú©Ø±Ø¯Ù† Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù‡Ø¯Ù
        let targetUsers = [];
        if (announcement.target === "all") {
          targetUsers = await User.find({}, "_id");
        } else if (announcement.target === "role") {
          targetUsers = await User.find({ role: { $in: announcement.roles } }, "_id");
        } else if (announcement.target === "users") {
          targetUsers = announcement.users.map((u) => ({ _id: u }));
        }

        // Ø§Ø±Ø³Ø§Ù„ Ù†ÙˆØªÛŒÙ Ùˆ Ø§Ø¹Ù„Ø§Ù† Ø²Ù†Ø¯Ù‡
        const io = getIO();
        for (const user of targetUsers) {
          await createNotification(
            user._id,
            "system",
            `Ø§Ø¹Ù„Ø§Ù† "${announcement.title}" Ù…Ù†Ù‚Ø¶ÛŒ Ø´Ø¯`,
            { announcementId: announcement._id, expired: true }
          );

          if (io) {
            io.to(user._id.toString()).emit("announcementExpired", {
              id: announcement._id,
              title: announcement.title,
              expiredAt: now,
            });
          }
        }
      }
    } catch (err) {
      console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§:", err);
    }
  });

  console.log("â° Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø±Ø±Ø³ÛŒ Ø§Ù†Ù‚Ø¶Ø§ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ ÙØ¹Ø§Ù„ Ø´Ø¯ (Ù‡Ø± Ø¯Ù‚ÛŒÙ‚Ù‡)");
};
