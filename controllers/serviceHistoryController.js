// controllers/serviceHistoryController.js
import ServiceHistory from "../models/ServiceHistory.js";
import Ticket from "../models/Ticket.js";
import { deleteFile, validateFile } from "../utils/fileService.js";

/**
 * ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ø±Ú©ÙˆØ±Ø¯ Ø³Ø±ÙˆÛŒØ³ (Ø«Ø¨Øª Ø®Ø¯Ù…Ø§Øª ÙÙ†ÛŒ)
 */
export const createServiceHistory = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "ØªÛŒÚ©Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    const files = req.files || {};
    const attachments = [];

    const allowedTypes = {
      image: ["image/png", "image/jpeg"],
      video: ["video/mp4"],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    // ðŸ“ Ù¾Ø±Ø¯Ø§Ø²Ø´ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§
    for (let key in files) {
      for (const f of files[key]) {
        const validation = validateFile(f, allowedTypes[key] || [], 50);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.message });
        }

        attachments.push({
          fileType: key,
          url: `/uploads/service/${f.filename}`,
          downloadable: key !== "video",
        });
      }
    }

    const history = await ServiceHistory.create({
      ticket: ticketId,
      technician: req.user._id,
      workType: req.body.workType,
      description: req.body.description,
      usedParts: req.body.usedParts || [],
      cost: req.body.cost || 0,
      attachments,
      location: req.body.location || null,
    });

    res.status(201).json({ success: true, history });
  } catch (err) {
    console.error("âŒ createServiceHistory error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ø®Ø¯Ù…Ø§Øª" });
  }
};

/**
 * ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª ØªØ§Ø±ÛŒØ®Ú†Ù‡â€ŒÛŒ Ø®Ø¯Ù…Ø§Øª Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ ÛŒÚ© ØªÛŒÚ©Øª
 */
export const getServiceHistoryByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const histories = await ServiceHistory.find({ ticket: ticketId })
      .populate("technician", "name email role")
      .sort({ createdAt: -1 });

    if (!histories.length)
      return res.status(404).json({ message: "Ù‡ÛŒÚ† Ø±Ú©ÙˆØ±Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    res.json({ success: true, histories });
  } catch (err) {
    console.error("âŒ getServiceHistoryByTicket error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ØªØ§Ø±ÛŒØ®Ú†Ù‡ Ø®Ø¯Ù…Ø§Øª" });
  }
};

/**
 * ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø±Ú©ÙˆØ±Ø¯ Ø³Ø±ÙˆÛŒØ³
 */
export const updateServiceHistory = async (req, res) => {
  try {
    const history = await ServiceHistory.findById(req.params.id);
    if (!history) return res.status(404).json({ message: "Ø³Ø±ÙˆÛŒØ³ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // ðŸ”’ Ú©Ù†ØªØ±Ù„ Ù…Ø¬ÙˆØ²
    if (
      req.user.role !== "admin" &&
      history.technician.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ ØºÛŒØ±Ù…Ø¬Ø§Ø²" });
    }

    const files = req.files || {};
    if (Object.keys(files).length > 0) {
      const allowedTypes = {
        image: ["image/png", "image/jpeg"],
        video: ["video/mp4"],
        document: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      };

      for (let key in files) {
        for (const f of files[key]) {
          const validation = validateFile(f, allowedTypes[key] || [], 50);
          if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
          }

          history.attachments.push({
            fileType: key,
            url: `/uploads/service/${f.filename}`,
            downloadable: key !== "video",
          });
        }
      }
    }

    Object.assign(history, req.body);
    await history.save();

    res.json({ success: true, history });
  } catch (err) {
    console.error("âŒ updateServiceHistory error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø³Ø±ÙˆÛŒØ³" });
  }
};

/**
 * ðŸ“Œ Ø­Ø°Ù Ø±Ú©ÙˆØ±Ø¯ Ø³Ø±ÙˆÛŒØ³
 */
export const deleteServiceHistory = async (req, res) => {
  try {
    const history = await ServiceHistory.findById(req.params.id);
    if (!history) return res.status(404).json({ message: "Ø±Ú©ÙˆØ±Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // ðŸ”’ ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ† ÛŒØ§ ØªÚ©Ù†Ø³ÛŒÙ† ØµØ§Ø­Ø¨ Ø±Ú©ÙˆØ±Ø¯
    if (
      req.user.role !== "admin" &&
      history.technician.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ ØºÛŒØ±Ù…Ø¬Ø§Ø²" });
    }

    for (const file of history.attachments) {
      deleteFile(file.url);
    }

    await history.deleteOne();
    res.json({ success: true, message: "Ø±Ú©ÙˆØ±Ø¯ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteServiceHistory error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø³Ø±ÙˆÛŒØ³" });
  }
};

/**
 * ðŸ“Œ Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø®Ø§Øµ Ø§Ø² ÛŒÚ© Ø±Ú©ÙˆØ±Ø¯
 */
export const removeAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl } = req.body;

    const history = await ServiceHistory.findById(id);
    if (!history) return res.status(404).json({ message: "Ø±Ú©ÙˆØ±Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    history.attachments = history.attachments.filter((a) => a.url !== fileUrl);
    await history.save();
    deleteFile(fileUrl);

    res.json({ success: true, message: "ÙØ§ÛŒÙ„ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ removeAttachment error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù ÙØ§ÛŒÙ„" });
  }
};
