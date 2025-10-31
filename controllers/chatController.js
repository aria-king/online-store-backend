import User from "../models/userModel.js";
import ChatMessage from "../models/chatMessage.js";
import {
  saveMessage,
  getConversation,
  getAllMessages,
  markMessagesAsRead,
} from "../services/chatService.js";
import { deleteFile } from "../utils/fileService.js";


// âœ… Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, messageType, content } = req.body;

    if (!req.user.chatEnabled) {
      return res.status(403).json({ message: "Ú†Øª Ø¨Ø±Ø§ÛŒ Ø´Ù…Ø§ ØºÛŒØ±ÙØ¹Ø§Ù„ Ø´Ø¯Ù‡ Ø§Ø³Øª" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: "Ú¯ÛŒØ±Ù†Ø¯Ù‡ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const newMessage = await saveMessage({
      sender: req.user._id,
      receiver: receiverId,
      messageType: messageType || "text",
      content: content || null,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("âŒ sendMessage error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…" });
  }
};

// âœ… Ø¯Ø±ÛŒØ§ÙØª Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨ÛŒÙ† Ø¯Ùˆ Ú©Ø§Ø±Ø¨Ø±
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await getConversation(req.user._id, userId);
    await markMessagesAsRead(req.user._id, userId);

    res.json(messages);
  } catch (err) {
    console.error("âŒ getMessages error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§" });
  }
};

// âœ… Ù…Ø¯ÛŒØ±: Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ Ú†Øªâ€ŒÙ‡Ø§
export const getAllChats = async (req, res) => {
  try {
    if (req.user.role !== "Ø§Ø¯Ù…ÛŒÙ†") {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ ØºÛŒØ±Ù…Ø¬Ø§Ø²" });
    }

    const chats = await getAllMessages();
    res.json(chats);
  } catch (err) {
    console.error("âŒ getAllChats error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú†Øªâ€ŒÙ‡Ø§" });
  }
};

// âœ… Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await markMessagesAsRead(req.user._id, userId);

    res.json({ message: "Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ø´Ø¯Ù†Ø¯" });
  } catch (err) {
    console.error("âŒ markAsRead error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§" });
  }
};

// âœ… Ø­Ø°Ù Ù¾ÛŒØ§Ù… ØªÚ©ÛŒ
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: "Ù¾ÛŒØ§Ù… ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // ÙÙ‚Ø· ÙØ±Ø³ØªÙ†Ø¯Ù‡ ÛŒØ§ Ø§Ø¯Ù…ÛŒÙ† Ø§Ø¬Ø§Ø²Ù‡ Ø­Ø°Ù Ø¯Ø§Ø±Ø¯
    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "Ø§Ø¯Ù…ÛŒÙ†"
    ) {
      return res.status(403).json({ message: "Ø§Ø¬Ø§Ø²Ù‡ Ø­Ø°Ù Ù¾ÛŒØ§Ù… Ø±Ø§ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    // Ø§Ú¯Ø± Ù¾ÛŒØ§Ù… ÙØ§ÛŒÙ„ Ø¯Ø§Ø±Ø¯ Ø­Ø°ÙØ´ Ú©Ù†
    if (message.fileUrl) {
      deleteFile(message.fileUrl);
    }

    await message.deleteOne();

    res.json({ message: "Ù¾ÛŒØ§Ù… Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteMessage error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù¾ÛŒØ§Ù…" });
  }
};

// âœ… Ø­Ø°Ù Ú©Ù„ Ù…Ú©Ø§Ù„Ù…Ù‡ Ø¨ÛŒÙ† Ø¯Ùˆ Ú©Ø§Ø±Ø¨Ø±
export const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ø§Ú¯Ù‡ Ø®ÙˆØ¯ Ú©Ø§Ø±Ø¨Ø± ÛŒØ§ Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø§Ø´Ù‡ Ø§Ø¬Ø§Ø²Ù‡ Ø¯Ø§Ø±Ù‡
    if (req.user.role !== "Ø§Ø¯Ù…ÛŒÙ†" && req.user._id.toString() === userId) {
  return res.status(400).json({ message: "Ø¨Ø±Ø§ÛŒ Ø­Ø°Ù Ù…Ú©Ø§Ù„Ù…Ù‡ Ø¨Ø§ Ø®ÙˆØ¯ØªØ§Ù† Ø§Ø² deleteMessage Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ù†ÛŒØ¯" });
}


    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    // Ø­Ø°Ù ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
    messages.forEach((msg) => {
      if (msg.fileUrl) deleteFile(msg.fileUrl);
    });

    // Ø­Ø°Ù Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§
    await ChatMessage.deleteMany({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    res.json({ message: "Ù…Ú©Ø§Ù„Ù…Ù‡ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteConversation error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù…Ú©Ø§Ù„Ù…Ù‡" });
  }
};

// âœ… Ø¬Ø³ØªØ¬ÙˆÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨ÛŒÙ† Ú©Ø§Ø±Ø¨Ø±Ø§Ù†
export const searchMessages = async (req, res) => {
  try {
    const { query, otherUserId } = req.query;
    if (!query || !otherUserId) {
      return res.status(400).json({ message: "Ù¾Ø§Ø±Ø§Ù…ØªØ±Ù‡Ø§ÛŒ Ù„Ø§Ø²Ù… Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª" });
    }

    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id },
      ],
      content: new RegExp(query, "i"),
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("âŒ searchMessages error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¬Ø³ØªØ¬ÙˆÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§" });
  }
};

// ✅ آمار پیام‌ها برای گزارش
export const getMessageStats = async (req, res) => {
  try {
    const totalMessages = await ChatMessage.countDocuments();
    const totalUsers = await User.countDocuments({ chatEnabled: true });
    const unreadMessages = await ChatMessage.countDocuments({ isRead: false });

    const stats = {
      totalMessages,
      unreadMessages,
      totalUsersWithChat: totalUsers,
    };

    if (res) return res.json(stats);
    return stats; // برای استفاده داخلی در reportController
  } catch (err) {
    console.error("❌ getMessageStats error:", err);
    if (res) res.status(500).json({ message: "خطا در محاسبه آمار پیام‌ها" });
  }
};
