import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, trim: true, default: null }, // Ù…Ø«Ù„ "image/png"
    size: { type: Number, default: 0 },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ðŸ”— Ø§Ø±ØªØ¨Ø§Ø· ÙØ§ÛŒÙ„ Ø¨Ø§ Ù‡Ø± Ù†ÙˆØ¹ Ù…ÙˆØ¬ÙˆØ¯ÛŒØª
    relatedEntityType: {
      type: String,
      enum: ["Task", "User", "Announcement", "Other"],
      required: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // âš™ï¸ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¬Ø§Ù†Ø¨ÛŒ
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// ðŸ” Ø§ÛŒÙ†Ø¯Ú©Ø³ Ø¨Ø±Ø§ÛŒ Ø¬Ø³ØªØ¬Ùˆ Ø³Ø±ÛŒØ¹â€ŒØªØ±
fileSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

const File = mongoose.models.File || mongoose.model("File", fileSchema);
export default File;
