import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    fileUrl: {
      type: String, // ðŸ“Œ Ù„ÛŒÙ†Ú© ÙØ§ÛŒÙ„ Ø¢Ù¾Ù„ÙˆØ¯Ø´Ø¯Ù‡
    },
    isRead: {
      type: Boolean,
      default: false, // ðŸ“Œ Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ±ÛŒØª Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ Ø¯ÛŒØ¯Ù‡â€ŒØ´Ø¯Ù‡
    },
  },
  { timestamps: true }
);

// âœ… Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø®Ø·Ø§ÛŒ OverwriteModelError
const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
