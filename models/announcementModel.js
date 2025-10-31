//models/announcementModel.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ø¹Ù†ÙˆØ§Ù† Ø§Ø¹Ù„Ø§Ù† Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, "Ù…ØªÙ† Ø§Ø¹Ù„Ø§Ù† Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
      trim: true,
      maxlength: 2000,
    },
    // Ø§Ø¹Ù„Ø§Ù† Ø¨Ø±Ø§ÛŒ Ú†Ù‡ Ú©Ø³Ø§Ù†ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯
    target: {
      type: String,
      enum: ["all", "role", "users"],
      default: "all",
    },
    // Ø§Ú¯Ø± target = role ÛŒØ§ users Ø¨Ø§Ø´Ø¯
    roles: [{ type: String }], // Ù…Ø«Ù„Ø§ ["manager", "employee"]
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ø²Ù…Ø§Ù† Ø§Ù†Ù‚Ø¶Ø§ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)
    expiresAt: { type: Date },

    // ÙˆØ¶Ø¹ÛŒØª ÙØ¹Ø§Ù„/ØºÛŒØ±ÙØ¹Ø§Ù„
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ø§ÙØ²ÙˆØ¯Ù† Ø§ÛŒÙ†Ø¯Ú©Ø³ Ø¨Ø±Ø§ÛŒ Ø¨Ù‡Ø¨ÙˆØ¯ Ø¬Ø³Øªâ€ŒÙˆØ¬Ùˆ
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isActive: 1, expiresAt: 1 });

const Announcement =
  mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

export default Announcement;
