// controllers/taskController.js
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import { logAudit } from "../services/auditService.js";
import AuditLog from "../models/AuditLog.js";
import File from "../models/fileModel.js";
import path from "path";
import fs from "fs";

/**
 * ðŸ“˜ Ø§ÛŒØ¬Ø§Ø¯ ØªØ³Ú© Ø¬Ø¯ÛŒØ¯
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo = [] } = req.body;

    if (assignedTo.length) {
      const users = await User.find({ _id: { $in: assignedTo } });
      if (users.length !== assignedTo.length)
        return res.status(400).json({ message: "ÛŒÚ©ÛŒ ÛŒØ§ Ú†Ù†Ø¯ Ú©Ø§Ø±Ø¨Ø± Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³ØªÙ†Ø¯" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user._id,
    });

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "create",
      changedBy: req.user._id,
      to: task.toObject(),
      notes: `Ø§ÛŒØ¬Ø§Ø¯ ØªØ³Ú©: ${title}`,
      ip: req.clientInfo?.ip || req.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("âŒ [createTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ ØªØ³Ú©" });
  }
};

/**
 * ðŸ“˜ Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ ØªØ³Ú©â€ŒÙ‡Ø§
 */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");
    res.json(tasks);
  } catch (err) {
    console.error("âŒ [getTasks] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ØªØ³Ú©â€ŒÙ‡Ø§" });
  }
};

/**
 * ðŸ“˜ Ø¯Ø±ÛŒØ§ÙØª ØªØ³Ú© Ø¨Ø§ ID
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    res.json(task);
  } catch (err) {
    console.error("âŒ [getTaskById] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ØªØ³Ú©" });
  }
};

/**
 * âœï¸ ÙˆÛŒØ±Ø§ÛŒØ´ ØªØ³Ú©
 */
export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const before = task.toObject();

    if (assignedTo) {
      const users = await User.find({ _id: { $in: assignedTo } });
      if (users.length !== assignedTo.length)
        return res.status(400).json({ message: "ÛŒÚ©ÛŒ ÛŒØ§ Ú†Ù†Ø¯ Ú©Ø§Ø±Ø¨Ø± Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³ØªÙ†Ø¯" });
      task.assignedTo = assignedTo;
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;

    // ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª (Status)
    if (status && status !== task.status) {
      const oldStatus = task.status;
      task.status = status;
      await logAudit({
        entityType: "Task",
        entityId: task._id,
        action: "status_change",
        changedBy: req.user._id,
        from: { status: oldStatus },
        to: { status },
        notes: `ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª ØªØ³Ú©: ${task.title}`,
        ip: req.clientInfo?.ip,
        userAgent: req.clientInfo?.userAgent,
      });
    }

    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "update",
      changedBy: req.user._id,
      from: before,
      to: task.toObject(),
      notes: `ÙˆÛŒØ±Ø§ÛŒØ´ ØªØ³Ú©: ${task.title}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ [updateTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± ÙˆÛŒØ±Ø§ÛŒØ´ ØªØ³Ú©" });
  }
};

/**
 * ðŸ—‘ï¸ Ø­Ø°Ù ØªØ³Ú©
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const before = task.toObject();
    await task.deleteOne();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "delete",
      changedBy: req.user._id,
      from: before,
      notes: `Ø­Ø°Ù ØªØ³Ú©: ${task.title}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json({ message: "ØªØ³Ú© Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ [deleteTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø­Ø°Ù ØªØ³Ú©" });
  }
};

/**
 * ðŸ‘¥ Ø§ÙØ²ÙˆØ¯Ù† Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¨Ù‡ ØªØ³Ú©
 */
export const assignUsersToTask = async (req, res) => {
  try {
    const { userIds } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const before = task.toObject();
    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length)
      return res.status(400).json({ message: "ÛŒÚ©ÛŒ ÛŒØ§ Ú†Ù†Ø¯ Ú©Ø§Ø±Ø¨Ø± Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³ØªÙ†Ø¯" });

    task.assignedTo = [...new Set([...task.assignedTo, ...userIds])];
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "assign_users",
      changedBy: req.user._id,
      from: before.assignedTo,
      to: task.assignedTo,
      notes: `Ø§ÙØ²ÙˆØ¯Ù† Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¨Ù‡ ØªØ³Ú©: ${task.title}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ [assignUsersToTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø§ÙØ²ÙˆØ¯Ù† Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¨Ù‡ ØªØ³Ú©" });
  }
};

/**
 * âŒ Ø­Ø°Ù Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø§Ø² ØªØ³Ú©
 */
export const removeUsersFromTask = async (req, res) => {
  try {
    const { userIds } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const before = task.toObject();

    task.assignedTo = task.assignedTo.filter(
      (id) => !userIds.includes(id.toString())
    );
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "remove_users",
      changedBy: req.user._id,
      from: before.assignedTo,
      to: task.assignedTo,
      notes: `Ø­Ø°Ù Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø§Ø² ØªØ³Ú©: ${task.title}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ [removeUsersFromTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ± Ø¯Ø± Ø­Ø°Ù Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø§Ø² ØªØ³Ú©" });
  }
};

/**
 * ðŸ“Ž Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ Ø¨Ø±Ø§ÛŒ ØªØ³Ú©
 */
export const uploadTaskFile = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (!req.file) return res.status(400).json({ message: "Ù‡ÛŒÚ† ÙØ§ÛŒÙ„ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯Ù‡" });

    const fileData = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    };

    task.attachments.push(fileData);
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "upload_file",
      changedBy: req.user._id,
      notes: `Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„ (${req.file.originalname}) Ø¨Ø±Ø§ÛŒ ØªØ³Ú©: ${task.title}`,
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.status(201).json({ message: "ÙØ§ÛŒÙ„ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¢Ù¾Ù„ÙˆØ¯ Ø´Ø¯", file: fileData });
  } catch (err) {
    console.error("âŒ [uploadTaskFile] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¢Ù¾Ù„ÙˆØ¯ ÙØ§ÛŒÙ„" });
  }
};

/**
 * ðŸ“œ ØªØ§Ø±ÛŒØ®Ú†Ù‡ ØªØºÛŒÛŒØ±Ø§Øª ØªØ³Ú©
 */
export const getTaskHistory = async (req, res) => {
  try {
    const taskId = req.params.id;
    const logs = await AuditLog.find({ entityType: "Task", entityId: taskId })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    if (!logs.length) {
      return res.json({ message: "Ù‡ÛŒÚ† Ø³Ø§Ø¨Ù‚Ù‡â€ŒØ§ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯", logs: [] });
    }

    res.json(logs);
  } catch (err) {
    console.error("âŒ [getTaskHistory] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ØªØ§Ø±ÛŒØ®Ú†Ù‡ ØªØ³Ú©" });
  }
};

/**
 * ðŸ·ï¸ Ø§ÙØ²ÙˆØ¯Ù† Ùˆ Ø­Ø°Ù ØªÚ¯â€ŒÙ‡Ø§
 */
export const addTagsToTask = async (req, res) => {
  try {
    const { tagIds } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    task.tags = [...new Set([...task.tags, ...tagIds])];
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "add_tags",
      changedBy: req.user._id,
      notes: `Ø§ÙØ²ÙˆØ¯Ù† ${tagIds.length} ØªÚ¯ Ø¨Ù‡ ØªØ³Ú©: ${task.title}`,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ [addTagsToTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÙØ²ÙˆØ¯Ù† ØªÚ¯â€ŒÙ‡Ø§" });
  }
};

export const removeTagsFromTask = async (req, res) => {
  try {
    const { tagIds } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    task.tags = task.tags.filter((id) => !tagIds.includes(id.toString()));
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "remove_tags",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù ${tagIds.length} ØªÚ¯ Ø§Ø² ØªØ³Ú©: ${task.title}`,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ [removeTagsFromTask] Error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ØªÚ¯â€ŒÙ‡Ø§" });
  }
};
