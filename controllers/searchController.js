import User from "../models/userModel.js";
import ChatMessage from "../models/chatMessage.js";
import Notification from "../models/notificationModel.js";

// ðŸ“Œ Helper Ø¨Ø±Ø§ÛŒ Ø³Ø§Ø®ØªÙ† sort Ø¯Ø§ÛŒÙ†Ø§Ù…ÛŒÚ©
const buildSort = (sortBy, order) => ({
  [sortBy]: order === "asc" ? 1 : -1,
});

// ðŸ” Ø¬Ø³ØªØ¬ÙˆÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†
export const searchUsers = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      role,
      status,
      isOnline,
    } = req.query;

    const skip = (page - 1) * limit;

    // ðŸŽ¯ Ø´Ø±Ø· Ø¬Ø³ØªØ¬Ùˆ
    const filters = {
      $or: [
        { name: new RegExp(query, "i") },
        { lastName: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ],
    };

    if (role) filters.role = role;
    if (status) filters.status = status;
    if (isOnline) filters.isOnline = isOnline === "true";

    const users = await User.find(filters)
      .sort(buildSort(sortBy, order))
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filters);

    res.json({ results: users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("âŒ searchUsers error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¬Ø³ØªØ¬ÙˆÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†" });
  }
};

// âœ‰ï¸ Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ (Ø¨Ø§ ÙÛŒÙ„ØªØ± Ù¾ÛŒØ´Ø±ÙØªÙ‡)
export const searchMessages = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      messageType,
      isRead,
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // ðŸŽ¯ Ø´Ø±Ø· Ø¬Ø³ØªØ¬Ùˆ
    const filters = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    };

    if (query) filters.content = new RegExp(query, "i");
    if (messageType) filters.messageType = messageType;
    if (isRead) filters.isRead = isRead === "true";
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const messages = await ChatMessage.find(filters)
      .populate("sender", "name lastName")
      .populate("receiver", "name lastName")
      .sort(buildSort(sortBy, order))
      .skip(skip)
      .limit(Number(limit));

    const total = await ChatMessage.countDocuments(filters);

    res.json({ results: messages, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("âŒ searchMessages error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¬Ø³ØªØ¬ÙˆÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§" });
  }
};

// ðŸ”” Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§
export const searchNotifications = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      type,
      isRead,
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // ðŸŽ¯ Ø´Ø±Ø· Ø¬Ø³ØªØ¬Ùˆ
    const filters = { user: req.user._id };

    if (query) filters.content = new RegExp(query, "i");
    if (type) filters.type = type;
    if (isRead) filters.isRead = isRead === "true";
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const notifications = await Notification.find(filters)
      .sort(buildSort(sortBy, order))
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filters);

    res.json({ results: notifications, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("âŒ searchNotifications error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¬Ø³ØªØ¬ÙˆÛŒ Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§" });
  }
};
