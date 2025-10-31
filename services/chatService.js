import ChatMessage from "../models/chatMessage.js";

/**
 * Ø°Ø®ÛŒØ±Ù‡ Ù¾ÛŒØ§Ù… Ø¬Ø¯ÛŒØ¯
 */
export const saveMessage = async ({ sender, receiver, messageType = "text", content, fileUrl }) => {
  const newMessage = await ChatMessage.create({
    sender,
    receiver,
    messageType,
    content,
    fileUrl,
  });

  return await newMessage
  .populate("sender", "name lastName role profileImage")
  .populate("receiver", "name lastName role profileImage");

};

/**
 * Ø¯Ø±ÛŒØ§ÙØª Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ Ø¨ÛŒÙ† Ø¯Ùˆ Ú©Ø§Ø±Ø¨Ø±
 */
export const getConversation = async (userId1, userId2) => {
  return await ChatMessage.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ],
  })
    .populate("sender", "name lastName role profileImage")
    .populate("receiver", "name lastName role profileImage")
    .sort({ createdAt: 1 });
};

/**
 * Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú†Øªâ€ŒÙ‡Ø§ (ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ±)
 */
export const getAllMessages = async () => {
  return await ChatMessage.find()
    .populate("sender", "name lastName role")
    .populate("receiver", "name lastName role")
    .sort({ createdAt: -1 });
};

/**
 * Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ Ø¯Ø±ÛŒØ§ÙØªÛŒ Ø¨Ù‡ Ø¹Ù†ÙˆØ§Ù† Ø®ÙˆØ§Ù†Ø¯Ù‡â€ŒØ´Ø¯Ù‡
 */
export const markMessagesAsRead = async (userId, otherUserId) => {
  return await ChatMessage.updateMany(
    { receiver: userId, sender: otherUserId, isRead: false },
    { $set: { isRead: true } }
  );
};
