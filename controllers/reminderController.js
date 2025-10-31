import Reminder from "../models/reminderModel.js";
import Task from "../models/taskModel.js";
import { logAudit } from "../services/auditService.js";

/**
 * ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ ÛŒØ§Ø¯Ø¢ÙˆØ± Ø¬Ø¯ÛŒØ¯
 */
export const createReminder = async (req, res) => {
  try {
    const {
      relatedEntityId,
      relatedEntityType = "Task",
      title,
      description,
      remindAt,
      repeat = "none",
      notifiedUsers = [],
    } = req.body;

    // Ø¨Ø±Ø±Ø³ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒØª Ù…Ø±ØªØ¨Ø· (ÙØ¹Ù„Ø§Ù‹ ÙÙ‚Ø· Task)
    if (relatedEntityType === "Task") {
      const foundTask = await Task.findById(relatedEntityId);
      if (!foundTask)
        return res.status(404).json({ message: "ØªØ³Ú© Ù…ÙˆØ±Ø¯ Ù†Ø¸Ø± ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    }

    const reminder = await Reminder.create({
      relatedEntityId,
      relatedEntityType,
      title,
      description,
      remindAt,
      repeat,
      createdBy: req.user._id,
      notifiedUsers,
    });

    await logAudit({
      entityType: "Reminder",
      entityId: reminder._id,
      action: "create",
      changedBy: req.user._id,
      notes: `Ø§ÛŒØ¬Ø§Ø¯ ÛŒØ§Ø¯Ø¢ÙˆØ± (${title}) Ø¨Ø±Ø§ÛŒ ${relatedEntityType}: ${relatedEntityId}`,
    });

    res.status(201).json(reminder);
  } catch (err) {
    console.error("âŒ createReminder error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ ÛŒØ§Ø¯Ø¢ÙˆØ±" });
  }
};

/**
 * ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§
 */
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate("createdBy", "name email")
      .populate("notifiedUsers", "name email")
      .populate({
        path: "relatedEntityId",
        select: "title",
        model: function (doc) {
          return doc.relatedEntityType;
        },
      });

    res.json(reminders);
  } catch (err) {
    console.error("âŒ getReminders error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§" });
  }
};

/**
 * ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª (ÙØ¹Ø§Ù„/ØºÛŒØ±ÙØ¹Ø§Ù„)
 */
export const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "ÛŒØ§Ø¯Ø¢ÙˆØ± ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    await logAudit({
      entityType: "Reminder",
      entityId: reminder._id,
      action: "toggle",
      changedBy: req.user._id,
      notes: `ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª ÛŒØ§Ø¯Ø¢ÙˆØ± "${reminder.title}" Ø¨Ù‡ ${
        reminder.isActive ? "ÙØ¹Ø§Ù„" : "ØºÛŒØ±ÙØ¹Ø§Ù„"
      }`,
    });

    res.json(reminder);
  } catch (err) {
    console.error("âŒ toggleReminder error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª ÛŒØ§Ø¯Ø¢ÙˆØ±" });
  }
};

/**
 * ðŸ“Œ Ø­Ø°Ù ÛŒØ§Ø¯Ø¢ÙˆØ±
 */
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "ÛŒØ§Ø¯Ø¢ÙˆØ± ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    await reminder.deleteOne();

    await logAudit({
      entityType: "Reminder",
      entityId: reminder._id,
      action: "delete",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù ÛŒØ§Ø¯Ø¢ÙˆØ± "${reminder.title}"`,
    });

    res.json({ message: "ÛŒØ§Ø¯Ø¢ÙˆØ± Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteReminder error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ÛŒØ§Ø¯Ø¢ÙˆØ±" });
  }
};
