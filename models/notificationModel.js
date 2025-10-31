// models/notificationModel.js
import mongoose from "mongoose";

/**
 * ðŸ”” Notification Schema
 * ---------------------------------------------------------
 * ðŸ“¦ Ø³Ø§Ø²Ú¯Ø§Ø± Ø¨Ø§ Ø³ÛŒØ³ØªÙ…â€ŒÙ‡Ø§ÛŒ:
 * - Socket.io (Ø§Ø±Ø³Ø§Ù„ Ø²Ù†Ø¯Ù‡)
 * - Audit Trail (logAudit)
 * - Pagination & Search
 * ---------------------------------------------------------
 * Ø´Ø§Ù…Ù„ Ø§ÛŒÙ†Ø¯Ú©Ø³â€ŒÙ‡Ø§ÛŒ Ø¨Ù‡ÛŒÙ†Ù‡ Ø¨Ø±Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±ØŒ ÙˆØ¶Ø¹ÛŒØª Ø®ÙˆØ§Ù†Ø¯Ù‡ Ø´Ø¯Ù† Ùˆ Ù†ÙˆØ¹ Ø§Ø¹Ù„Ø§Ù†.
 */
const notificationSchema = new mongoose.Schema(
  {
    // ðŸ‘¤ Ø¯Ø±ÛŒØ§ÙØªâ€ŒÚ©Ù†Ù†Ø¯Ù‡ Ø§Ø¹Ù„Ø§Ù†
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ðŸ· Ù†ÙˆØ¹ Ø§Ø¹Ù„Ø§Ù†
    type: {
      type: String,
      enum: ["warranty", "order", "system", "message", "security", "custom"],
      required: true,
      default: "system",
      index: true,
    },

    // ðŸ“ Ù…Ø­ØªÙˆØ§ÛŒ Ù…ØªÙ†ÛŒ Ø§Ø¹Ù„Ø§Ù†
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // ðŸ“¦ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ Ù…Ø±ØªØ¨Ø· (Ù…Ø«Ù„Ø§Ù‹ Ø´Ù†Ø§Ø³Ù‡ Ø³ÙØ§Ø±Ø´ ÛŒØ§ ØªÛŒÚ©Øª)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ðŸ“… ÙˆØ¶Ø¹ÛŒØª Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù†
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ðŸŒ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ú©Ù„Ø§ÛŒÙ†Øª (Ø§Ø®ØªÛŒØ§Ø±ÛŒ Ø¨Ø±Ø§ÛŒ Ø±Ø¯ÛŒØ§Ø¨ÛŒ)
    clientInfo: {
      ip: { type: String, default: null },
      userAgent: { type: String, default: null },
    },

    // âš™ï¸ ÙˆØ¶Ø¹ÛŒØª Ú©Ù„ÛŒ Ø§Ø¹Ù„Ø§Ù† (ÙØ¹Ø§Ù„ / Ø­Ø°Ùâ€ŒØ´Ø¯Ù‡ / Ø¢Ø±Ø´ÛŒÙˆ)
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------
   ðŸ§¹ Ù¾Ø§Ú©â€ŒØ³Ø§Ø²ÛŒ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ù‚Ø¨Ù„ Ø§Ø² JSON Ø®Ø±ÙˆØ¬ÛŒ
---------------------------------------------- */
notificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/* ---------------------------------------------
   ðŸ”Ž Ø§ÛŒÙ†Ø¯Ú©Ø³â€ŒÙ‡Ø§ÛŒ Ù¾Ø±Ú©Ø§Ø±Ø¨Ø±Ø¯
---------------------------------------------- */
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// â³ TTL Ø§Ø®ØªÛŒØ§Ø±ÛŒ (Ø§Ú¯Ø± Ø¨Ø®ÙˆØ§ÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ Ø¨Ø¹Ø¯ Ø§Ø² Ù…Ø¯ØªÛŒ Ø­Ø°Ù Ø´Ù†)
if (process.env.NOTIFICATION_EXPIRE_DAYS) {
  notificationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: parseInt(process.env.NOTIFICATION_EXPIRE_DAYS) * 86400 }
  );
}

/* ---------------------------------------------
   ðŸ“‹ Ù…ØªØ¯ Ú©Ù…Ú©ÛŒ Ø¨Ø±Ø§ÛŒ Ø®Ù„Ø§ØµÙ‡ Ù†Ù…Ø§ÛŒØ´
---------------------------------------------- */
notificationSchema.methods.summary = function () {
  return {
    id: this._id,
    type: this.type,
    content: this.content,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
