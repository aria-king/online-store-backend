// services/reminderService.js
import Reminder from "../models/reminderModel.js";
import Task from "../models/taskModel.js";
import { createNotification, sendBulkNotifications } from "./notificationService.js";
import { logAudit } from "./auditService.js";
import dayjs from "dayjs";

/**
 * â° Ø¨Ø±Ø±Ø³ÛŒ ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§ÛŒ Ù…ÙˆØ¹Ø¯Ø¯Ø§Ø± (Ø§Ø¬Ø±Ø§ ØªÙˆØ³Ø· Ú©Ø±ÙˆÙ†â€ŒØ¬Ø§Ø¨)
 * Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯ Ú©Ù‡ Ú©Ø¯Ø§Ù… ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§ Ù…ÙˆØ¹Ø¯Ø´Ø§Ù† Ø±Ø³ÛŒØ¯Ù‡ Ø§Ø³ØªØŒ
 * Ø³Ù¾Ø³ Ù†ÙˆØªÛŒÙ Ø§Ø±Ø³Ø§Ù„ Ú©Ø±Ø¯Ù‡ Ùˆ ÙˆØ¶Ø¹ÛŒØª Ø±Ø§ Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
 */
export const checkDueReminders = async (req, res) => {
  try {
    const now = new Date();

    // ÙÙ‚Ø· ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§ÛŒ ÙØ¹Ø§Ù„ Ú©Ù‡ Ø²Ù…Ø§Ù†â€ŒØ´Ø§Ù† Ú¯Ø°Ø´ØªÙ‡ Ùˆ Ù†ÙˆØªÛŒÙ Ù‡Ù†ÙˆØ² Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡
    const dueReminders = await Reminder.find({
      isActive: true,
      remindAt: { $lte: now },
      notifiedUsers: { $size: 0 },
    }).populate("task", "title assignedTo");

    if (!dueReminders.length) {
      if (res) return res.json({ message: "ÛŒØ§Ø¯Ø¢ÙˆØ± Ù…ÙˆØ¹Ø¯Ø¯Ø§Ø± ÛŒØ§ÙØª Ù†Ø´Ø¯" });
      return;
    }

    for (const reminder of dueReminders) {
      const task = reminder.task;

      // Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù‡Ø¯Ù Ù†ÙˆØªÛŒÙ: Ø³Ø§Ø²Ù†Ø¯Ù‡ ÛŒØ§Ø¯Ø¢ÙˆØ± + Ú©Ø§Ø±Ø¨Ø±Ø§Ù† ØªØ³Ú©
      const targetUsers = new Set([
        reminder.createdBy.toString(),
        ...(task?.assignedTo?.map((u) => u.toString()) || []),
      ]);

      // ðŸ“¢ Ø§Ø±Ø³Ø§Ù„ Ø§Ø¹Ù„Ø§Ù† Ø¨Ø±Ø§ÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ù‡Ø¯Ù
      await sendBulkNotifications(
        [...targetUsers],
        "reminder_due",
        `â° Ø²Ù…Ø§Ù† ÛŒØ§Ø¯Ø¢ÙˆØ± "${reminder.title}" Ø¨Ø±Ø§ÛŒ ØªØ³Ú© "${task?.title}" ÙØ±Ø§ Ø±Ø³ÛŒØ¯Ù‡ Ø§Ø³Øª.`,
        { reminderId: reminder._id, taskId: task?._id }
      );

      // Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª ÛŒØ§Ø¯Ø¢ÙˆØ±
      reminder.notifiedUsers = [...targetUsers];
      reminder.isActive = false;
      await reminder.save();

      // Ø«Ø¨Øª Ù„Ø§Ú¯
      await logAudit({
        entityType: "Reminder",
        entityId: reminder._id,
        action: "notify_due",
        changedBy: reminder.createdBy,
        notes: `Ø§Ø±Ø³Ø§Ù„ ÛŒØ§Ø¯Ø¢ÙˆØ± "${reminder.title}" Ø¨Ø±Ø§ÛŒ ØªØ³Ú© "${task?.title}"`,
      });
    }

    if (res)
      res.json({ message: `${dueReminders.length} ÛŒØ§Ø¯Ø¢ÙˆØ± Ù…ÙˆØ¹Ø¯Ø¯Ø§Ø± Ù¾Ø±Ø¯Ø§Ø²Ø´ Ø´Ø¯` });
  } catch (err) {
    console.error("âŒ checkDueReminders error:", err);
    if (res)
      res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±Ø±Ø³ÛŒ ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§ÛŒ Ù…ÙˆØ¹Ø¯Ø¯Ø§Ø±" });
  }
};

/**
 * ðŸ•’ Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒ Ø®ÙˆØ¯Ú©Ø§Ø± (Ø¯Ø± Ú©Ø±ÙˆÙ†â€ŒØ¬Ø§Ø¨)
 * Ø¯Ø± ÙØ§ÛŒÙ„ Ø§ØµÙ„ÛŒ Ø³Ø±ÙˆØ± Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯:
 *    import { startReminderScheduler } from "./services/reminderService.js";
 *    startReminderScheduler();
 */
export const startReminderScheduler = () => {
  console.log("ðŸ” Reminder scheduler started (every 1 min)");
  setInterval(async () => {
    try {
      await checkDueReminders();
    } catch (err) {
      console.error("Reminder scheduler failed:", err);
    }
  }, 60 * 1000); // Ù‡Ø± Û¶Û° Ø«Ø§Ù†ÛŒÙ‡
};
