import mongoose from "mongoose";

const announcementReadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ø§Ø·Ù…ÛŒÙ†Ø§Ù† Ø§Ø² Ø§ÛŒÙ†Ú©Ù‡ ÛŒÚ© Ú©Ø§Ø±Ø¨Ø± Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø§Ø¹Ù„Ø§Ù† ÙÙ‚Ø· ÛŒÚ© Ø±Ú©ÙˆØ±Ø¯ Ø¯Ø§Ø±Ù‡
announcementReadSchema.index({ user: 1, announcement: 1 }, { unique: true });

// Ø¨Ø±Ø§ÛŒ Ø¯Ø³ØªØ±Ø³ÛŒ Ø³Ø±ÛŒØ¹ Ø¨Ù‡ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒÙ†Ø´Ø¯Ù‡
announcementReadSchema.index({ user: 1, readAt: 1 });

const AnnouncementRead =
  mongoose.models.AnnouncementRead ||
  mongoose.model("AnnouncementRead", announcementReadSchema);

export default AnnouncementRead;
