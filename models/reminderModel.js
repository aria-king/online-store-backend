import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    // ðŸ“Ž Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ ØªØ³Ú© Ø®Ø§Øµ (Ø¯Ø± Ø¢ÛŒÙ†Ø¯Ù‡ Ù…ÛŒâ€ŒØªÙˆÙ†Ù‡ Ø±ÙˆÛŒØ¯Ø§Ø¯ ÛŒØ§ Ù…ÙˆØ¬ÙˆØ¯ÛŒØª Ø¯ÛŒÚ¯Ù‡ Ù‡Ù… Ø¨Ø§Ø´Ù‡)
    relatedEntityType: {
      type: String,
      enum: ["Task", "Event", "Custom"],
      default: "Task",
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedEntityType", // Ù¾ÙˆÛŒØ§ Ø¨Ø± Ø§Ø³Ø§Ø³ Ù†ÙˆØ¹
      required: true,
    },

    // ðŸ· Ø¹Ù†ÙˆØ§Ù† ÛŒØ§Ø¯Ø¢ÙˆØ±
    title: {
      type: String,
      required: [true, "Ø¹Ù†ÙˆØ§Ù† ÛŒØ§Ø¯Ø¢ÙˆØ± Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
      trim: true,
      maxlength: 200,
    },

    // ØªÙˆØ¶ÛŒØ­Ø§Øª
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // â° Ø²Ù…Ø§Ù† ÛŒØ§Ø¯Ø¢ÙˆØ±ÛŒ
    remindAt: {
      type: Date,
      required: [true, "Ø²Ù…Ø§Ù† ÛŒØ§Ø¯Ø¢ÙˆØ±ÛŒ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
    },

    // ðŸ” Ù†ÙˆØ¹ ØªÚ©Ø±Ø§Ø±
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "yearly"],
      default: "none",
    },

    // ðŸ‘¤ Ø§ÛŒØ¬Ø§Ø¯Ú©Ù†Ù†Ø¯Ù‡ ÛŒØ§Ø¯Ø¢ÙˆØ±
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ðŸ”” Ú©Ø§Ø±Ø¨Ø±Ø§Ù†ÛŒ Ú©Ù‡ Ø¨Ø§ÛŒØ¯ Ù†ÙˆØªÛŒÙ Ø¯Ø±ÛŒØ§ÙØª Ú©Ù†Ù†Ø¯
    notifiedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ø§Ù„ Ø¨ÙˆØ¯Ù† ÛŒØ§Ø¯Ø¢ÙˆØ±
    isActive: {
      type: Boolean,
      default: true,
    },

    // Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø§Ø±Ø³Ø§Ù„ Ú†Ù†Ø¯Ø¨Ø§Ø±Ù‡ (Ø¨Ø±Ø§ÛŒ cron job)
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

export default Reminder;
