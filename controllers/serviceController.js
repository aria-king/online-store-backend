// controllers/serviceController.js
import ServiceHistory from "../models/ServiceHistory.js";
import Ticket from "../models/Ticket.js";
import { deleteFile, validateFile } from "../utils/fileService.js";

/**
 * ðŸ“Œ Ø«Ø¨Øª Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³ ØªÙˆØ³Ø· ØªÚ©Ù†Ø³ÛŒÙ† ÛŒØ§ Ù†ØµØ§Ø¨
 */
export const addServiceReport = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { description, workType, usedParts, cost, province, city } = req.body;

    // Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ¬ÙˆØ¯ ØªÛŒÚ©Øª
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª (ØªÛŒÚ©Øª) ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // Ø¨Ø±Ø±Ø³ÛŒ Ù†Ù‚Ø´ Ú©Ø§Ø±Ø¨Ø±
    if (!["technician", "installer"].includes(req.user.role)) {
      return res.status(403).json({ message: "Ø´Ù…Ø§ Ù…Ø¬Ø§Ø² Ø¨Ù‡ Ø«Ø¨Øª Ú¯Ø²Ø§Ø±Ø´ Ù†ÛŒØ³ØªÛŒØ¯" });
    }

    // ðŸ“ Ø¨Ø±Ø±Ø³ÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ø¢Ù¾Ù„ÙˆØ¯ÛŒ
    const files = req.files || {};
    const attachments = [];

    for (let key in files) {
      for (const f of files[key]) {
        const allowedTypes = {
          image: ["image/png", "image/jpeg"],
          video: ["video/mp4"],
          document: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        };

        const validation = validateFile(f, allowedTypes[key] || [], 50);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.message });
        }

        attachments.push({
          fileType: key,
          url: `/uploads/service/${f.filename}`,
          downloadable: key !== "video", // Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø¯Ø§Ù†Ù„ÙˆØ¯ Ù…Ø³ØªÙ‚ÛŒÙ… ÙˆÛŒØ¯ÛŒÙˆ
        });
      }
    }

    // ðŸ“„ Ø§ÛŒØ¬Ø§Ø¯ Ø±Ú©ÙˆØ±Ø¯ Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³
    const report = await ServiceHistory.create({
      ticket: ticketId,
      technician: req.user._id,
      workType: workType || "repair",
      description,
      usedParts: usedParts ? JSON.parse(usedParts) : [],
      cost: cost ? Number(cost) : 0,
      attachments,
      location: `${province || ""} ${city || ""}`.trim() || null,
    });

    res.status(201).json({
      success: true,
      message: "Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø«Ø¨Øª Ø´Ø¯",
      report,
    });
  } catch (err) {
    console.error("âŒ addServiceReport error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³" });
  }
};

/**
 * ðŸ“Š Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§ÛŒ ÛŒÚ© ØªÛŒÚ©Øª
 */
export const getServiceReports = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const reports = await ServiceHistory.find({ ticket: ticketId })
      .populate("technician", "name email role")
      .sort({ createdAt: -1 });

    if (!reports || reports.length === 0)
      return res.status(404).json({ message: "Ù‡ÛŒÚ† Ú¯Ø²Ø§Ø±Ø´ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† ØªÛŒÚ©Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    res.status(200).json({
      success: true,
      total: reports.length,
      reports,
    });
  } catch (err) {
    console.error("âŒ getServiceReports error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ú¯Ø²Ø§Ø±Ø´â€ŒÙ‡Ø§" });
  }
};

/**
 * ðŸ—‘ Ø­Ø°Ù Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³ (ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ± ÛŒØ§ ØªÚ©Ù†Ø³ÛŒÙ† Ú¯Ø²Ø§Ø±Ø´â€ŒØ¯Ù‡Ù†Ø¯Ù‡)
 */
export const deleteServiceReport = async (req, res) => {
  try {
    const report = await ServiceHistory.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Ú¯Ø²Ø§Ø±Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // ÙÙ‚Ø· Ù…Ø¯ÛŒØ± ÛŒØ§ Ù…Ø§Ù„Ú© Ú¯Ø²Ø§Ø±Ø´ Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø­Ø°Ù Ú©Ù†Ø¯
    if (
      req.user.role !== "admin" &&
      report.technician.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Ø§Ø¬Ø§Ø²Ù‡ Ø­Ø°Ù Ø§ÛŒÙ† Ú¯Ø²Ø§Ø±Ø´ Ø±Ø§ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    // Ø­Ø°Ù ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ù¾ÛŒÙˆØ³Øª Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯
    if (report.attachments && report.attachments.length > 0) {
      for (const file of report.attachments) {
        try {
          deleteFile(file.url);
        } catch (e) {
          console.warn("âš ï¸ Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯:", file.url);
        }
      }
    }

    await report.deleteOne();
    res.status(200).json({ success: true, message: "Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteServiceReport error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ú¯Ø²Ø§Ø±Ø´ Ø³Ø±ÙˆÛŒØ³" });
  }
};
