                                                                           
//tagController.js
import Tag from "../models/tagModel.js";
import Task from "../models/taskModel.js";
import { logAudit } from "../services/auditService.js";

// ðŸ“Œ Ø³Ø§Ø®Øª ØªÚ¯ Ø¬Ø¯ÛŒØ¯
export const createTag = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    const exists = await Tag.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "Ø§ÛŒÙ† ØªÚ¯ Ù‚Ø¨Ù„Ø§Ù‹ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù‡ Ø§Ø³Øª" });

    const tag = await Tag.create({
      name: name.trim(),
      color,
      description,
      createdBy: req.user._id,
    });

    await logAudit({
      entityType: "Tag",
      entityId: tag._id,
      action: "create",
      changedBy: req.user._id,
      notes: `Ø§ÛŒØ¬Ø§Ø¯ Ø¨Ø±Ú†Ø³Ø¨: ${tag.name}`,
    });

    res.status(201).json(tag);
  } catch (err) {
    console.error("âŒ createTag error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ø¨Ø±Ú†Ø³Ø¨" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª ØªÙ…Ø§Ù… ØªÚ¯â€ŒÙ‡Ø§
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    console.error("âŒ getTags error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§" });
  }
};

// ðŸ“Œ ÙˆÛŒØ±Ø§ÛŒØ´ ØªÚ¯
export const updateTag = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "ØªÚ¯ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    tag.name = name || tag.name;
    tag.color = color || tag.color;
    tag.description = description || tag.description;

    await tag.save();

    await logAudit({
      entityType: "Tag",
      entityId: tag._id,
      action: "update",
      changedBy: req.user._id,
      notes: `ÙˆÛŒØ±Ø§ÛŒØ´ Ø¨Ø±Ú†Ø³Ø¨: ${tag.name}`,
    });

    res.json(tag);
  } catch (err) {
    console.error("âŒ updateTag error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± ÙˆÛŒØ±Ø§ÛŒØ´ Ø¨Ø±Ú†Ø³Ø¨" });
  }
};

// ðŸ“Œ Ø­Ø°Ù ØªÚ¯
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "ØªÚ¯ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // Ø­Ø°Ù ØªÚ¯ Ø§Ø² ØªÙ…Ø§Ù… ØªØ³Ú©â€ŒÙ‡Ø§
    if (tag?.name) {
  await Task.updateMany({}, { $pull: { tags: tag.name } });
}

    await tag.deleteOne();

    await logAudit({
      entityType: "Tag",
      entityId: tag._id,
      action: "delete",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù Ø¨Ø±Ú†Ø³Ø¨: ${tag.name}`,
    });

    res.json({ message: "ØªÚ¯ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteTag error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø¨Ø±Ú†Ø³Ø¨" });
  }
};

// ðŸ“Œ Ø§ÙØ²ÙˆØ¯Ù† ØªÚ¯ Ø¨Ù‡ ØªØ³Ú©
export const addTagToTask = async (req, res) => {
  try {
    const { tagName } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (!task.tags.includes(tagName)) task.tags.push(tagName);
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "add_tag",
      changedBy: req.user._id,
      notes: `Ø§ÙØ²ÙˆØ¯Ù† ØªÚ¯ ${tagName} Ø¨Ù‡ ØªØ³Ú©: ${task.title}`,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ addTagToTask error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÙØ²ÙˆØ¯Ù† ØªÚ¯ Ø¨Ù‡ ØªØ³Ú©" });
  }
};

// ðŸ“Œ Ø­Ø°Ù ØªÚ¯ Ø§Ø² ØªØ³Ú©
export const removeTagFromTask = async (req, res) => {
  try {
    const { tagName } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "ØªØ³Ú© ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    task.tags = task.tags.filter((t) => t !== tagName);
    await task.save();

    await logAudit({
      entityType: "Task",
      entityId: task._id,
      action: "remove_tag",
      changedBy: req.user._id,
      notes: `Ø­Ø°Ù ØªÚ¯ ${tagName} Ø§Ø² ØªØ³Ú©: ${task.title}`,
    });

    res.json(task);
  } catch (err) {
    console.error("âŒ removeTagFromTask error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ØªÚ¯ Ø§Ø² ØªØ³Ú©" });
  }
};
