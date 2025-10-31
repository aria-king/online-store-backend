import { Server } from "socket.io";
import { saveMessage, markMessagesAsRead } from "./chatService.js";
import ChatMessage from "../models/chatMessage.js";
import { deleteFile } from "../utils/fileService.js";
import User from "../models/userModel.js";
import { createNotification } from "../services/notificationService.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("ðŸ”— Ú©Ø§Ø±Ø¨Ø± Ù…ØªØµÙ„ Ø´Ø¯:", socket.id);

    // ðŸ“Œ Ø§ØªØµØ§Ù„ Ú©Ø§Ø±Ø¨Ø±
    socket.on("join", async (userId) => {
      socket.join(userId);
      socket.userId = userId;

      // âœ… ÙˆØ¶Ø¹ÛŒØª Ø¢Ù†Ù„Ø§ÛŒÙ†
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("userStatus", { userId, isOnline: true });

      // ðŸ”” Ø§Ø¹Ù„Ø§Ù† Ø¨Ø±Ø§ÛŒ ÙˆØ¶Ø¹ÛŒØª Ø¢Ù†Ù„Ø§ÛŒÙ†
      await createNotification(
        userId,
        "status",
        "ÙˆØ¶Ø¹ÛŒØª Ø´Ù…Ø§ Ø¨Ù‡ Ø¢Ù†Ù„Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ú©Ø±Ø¯",
        { status: "online" }
      );

      await broadcastOnlineUsers(); // ðŸ‘ˆ Ø¨ÙØ±Ø³Øª Ù„ÛŒØ³Øª Ø¢Ù†Ù„Ø§ÛŒÙ†â€ŒÙ‡Ø§
      console.log(`ðŸ‘¤ Ú©Ø§Ø±Ø¨Ø± ${userId} Ø¢Ù†Ù„Ø§ÛŒÙ† Ø´Ø¯`);
    });

    // ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…
    socket.on("sendMessage", async (messageData) => {
      try {
        const { sender, receiver, content, messageType, fileUrl } = messageData;

        const newMessage = await saveMessage({
          sender,
          receiver,
          messageType,
          content,
          fileUrl,
        });

        io.to(receiver.toString()).emit("receiveMessage", newMessage);
        io.to(sender.toString()).emit("messageSent", newMessage);

        // ðŸ”” Ø§Ø¹Ù„Ø§Ù† Ø¨Ø±Ø§ÛŒ Ù¾ÛŒØ§Ù…
        await createNotification(
          receiver,
          "message",
          "Ù¾ÛŒØ§Ù… Ø¬Ø¯ÛŒØ¯ Ø¯Ø±ÛŒØ§ÙØª Ú©Ø±Ø¯ÛŒØ¯",
          { sender, messageId: newMessage._id }
        );

        console.log("âœ‰ï¸ Ù¾ÛŒØ§Ù… Ø°Ø®ÛŒØ±Ù‡ Ùˆ Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯:", newMessage._id);
      } catch (err) {
        console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± sendMessage:", err);
        socket.emit("error", { message: "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…" });
      }
    });

    // ðŸ“Œ Ø¹Ù„Ø§Ù…Øªâ€ŒÚ¯Ø°Ø§Ø±ÛŒ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§
    socket.on("markAsRead", async ({ userId, otherUserId }) => {
      try {
        await markMessagesAsRead(userId, otherUserId);
        io.to(otherUserId.toString()).emit("messagesRead", { by: userId });
      } catch (err) {
        console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± markAsRead:", err);
      }
    });

    // ðŸ“Œ Ø­Ø°Ù Ù¾ÛŒØ§Ù…
    socket.on("deleteMessage", async ({ messageId, userId, role }) => {
      try {
        const message = await ChatMessage.findById(messageId);
        if (!message) return;

        if (
          message.sender.toString() !== userId.toString() &&
          role !== "Ø§Ø¯Ù…ÛŒÙ†"
        ) {
          return;
        }

        if (message.fileUrl) {
          deleteFile(message.fileUrl);
        }

        await message.deleteOne();

        io.to(message.receiver.toString()).emit("messageDeleted", messageId);
        io.to(message.sender.toString()).emit("messageDeleted", messageId);

        console.log(`ðŸ—‘ï¸ Ù¾ÛŒØ§Ù… ${messageId} Ø­Ø°Ù Ø´Ø¯`);
      } catch (err) {
        console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± deleteMessage:", err);
      }
    });

    // ðŸ“Œ Ø­Ø°Ù Ù…Ú©Ø§Ù„Ù…Ù‡
    socket.on("deleteConversation", async ({ userId, otherUserId, role }) => {
      try {
        if (role !== "Ø§Ø¯Ù…ÛŒÙ†" && socket.userId?.toString() !== userId.toString()) {
          return;
        }

        const messages = await ChatMessage.find({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
          ],
        });

        messages.forEach((msg) => {
          if (msg.fileUrl) deleteFile(msg.fileUrl);
        });

        await ChatMessage.deleteMany({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId },
          ],
        });

        io.to(userId.toString()).emit("conversationDeleted", { with: otherUserId });
        io.to(otherUserId.toString()).emit("conversationDeleted", { with: userId });

        console.log(`ðŸ—‘ï¸ Ù…Ú©Ø§Ù„Ù…Ù‡ Ø¨ÛŒÙ† ${userId} Ùˆ ${otherUserId} Ø­Ø°Ù Ø´Ø¯`);
      } catch (err) {
        console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± deleteConversation:", err);
      }
    });

    // ðŸ“Œ Ù‚Ø·Ø¹ Ø§ØªØµØ§Ù„
    socket.on("disconnect", async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit("userStatus", { userId: socket.userId, isOnline: false });

        // ðŸ”” Ø§Ø¹Ù„Ø§Ù† Ø¢ÙÙ„Ø§ÛŒÙ†
        await createNotification(
          socket.userId,
          "status",
          "ÙˆØ¶Ø¹ÛŒØª Ø´Ù…Ø§ Ø¨Ù‡ Ø¢ÙÙ„Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ú©Ø±Ø¯",
          { status: "offline" }
        );

        await broadcastOnlineUsers();
        console.log(`âŒ Ú©Ø§Ø±Ø¨Ø± ${socket.userId} Ø¢ÙÙ„Ø§ÛŒÙ† Ø´Ø¯`);
      }
      console.log("âŒ Ú©Ø§Ø±Ø¨Ø± Ù‚Ø·Ø¹ Ø´Ø¯:", socket.id);
    });
  });

  // ðŸ“Œ Ù„ÛŒØ³Øª Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¢Ù†Ù„Ø§ÛŒÙ†
  const broadcastOnlineUsers = async () => {
    const users = await User.find({ isOnline: true }).select("_id name lastName role");
    io.emit("onlineUsersUpdate", users);
  };

  return io;
};

export const getIO = () => io;
