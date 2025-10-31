// controllers/trainingController.js
import TrainingContent from "../models/TrainingContent.js";
import { deleteFile, validateFile } from "../utils/fileService.js";

// ðŸ“Œ Ø§Ø¶Ø§ÙÙ‡ Ú©Ø±Ø¯Ù† Ù…Ø­ØªÙˆØ§ Ø¢Ù…ÙˆØ²Ø´ÛŒ
export const createTrainingContent = async (req, res) => {
  try {
    const { title, description, contentType, accessRoles } = req.body;
    const file = req.file;

    if (contentType !== "text" && !file) {
      return res.status(400).json({ message: "ÙØ§ÛŒÙ„ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª" });
    }

    // Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ ÙØ§ÛŒÙ„
    if (file) {
      const allowedTypes = {
        image: ["image/png", "image/jpeg"],
        video: ["video/mp4"],
        document: ["application/pdf", "application/msword",
                   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      };

      const validation = validateFile(file, allowedTypes[contentType] || [], 50);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
    }

    const content = await TrainingContent.create({
      title,
      description,
      contentType,
      url: file ? `/uploads/training/${file.filename}` : null,
      accessRoles,
      downloadable: contentType !== "video"
    });

    res.status(201).json(content);
  } catch (err) {
    console.error("âŒ createTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø¶Ø§ÙÙ‡ Ú©Ø±Ø¯Ù† Ù…Ø­ØªÙˆØ§" });
  }
};

// ðŸ“Œ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù„ÛŒØ³Øª Ù…Ø­ØªÙˆØ§ Ø¢Ù…ÙˆØ²Ø´ÛŒ
export const getTrainingList = async (req, res) => {
  try {
    const role = req.user.role;
    let contents;

    if (role === "admin") {
      contents = await TrainingContent.find().sort({ createdAt: -1 });
    } else {
      contents = await TrainingContent.find({ accessRoles: { $in: [role] } }).sort({ createdAt: -1 });
    }

    res.json(contents);
  } catch (err) {
    console.error("âŒ getTrainingList error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØªÙˆØ§" });
  }
};

// ðŸ“Œ Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ù…Ø­ØªÙˆØ§
export const getTrainingById = async (req, res) => {
  try {
    const role = req.user.role;
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ù…Ø­ØªÙˆØ§ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (role !== "admin" && !content.accessRoles.includes(role)) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    res.json(content);
  } catch (err) {
    console.error("âŒ getTrainingById error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù…Ø­ØªÙˆØ§" });
  }
};

// ðŸ“Œ ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø­ØªÙˆØ§
export const updateTrainingContent = async (req, res) => {
  try {
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ù…Ø­ØªÙˆØ§ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const file = req.file;
    if (file) {
      const allowedTypes = {
        image: ["image/png", "image/jpeg"],
        video: ["video/mp4"],
        document: ["application/pdf", "application/msword",
                   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
      };
      const validation = validateFile(file, allowedTypes[req.body.contentType] || [], 50);
      if (!validation.valid) return res.status(400).json({ message: validation.message });

      if (content.url) deleteFile(content.url);
      content.url = `/uploads/training/${file.filename}`;
    }

    Object.assign(content, req.body);
    await content.save();

    res.json(content);
  } catch (err) {
    console.error("âŒ updateTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…Ø­ØªÙˆØ§" });
  }
};

// ðŸ“Œ Ø­Ø°Ù Ù…Ø­ØªÙˆØ§
export const deleteTrainingContent = async (req, res) => {
  try {
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ù…Ø­ØªÙˆØ§ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (content.url) deleteFile(content.url);
    await content.deleteOne();

    res.json({ message: "Ù…Ø­ØªÙˆØ§ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù…Ø­ØªÙˆØ§" });
  }
};
