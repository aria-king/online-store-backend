import Feedback from "../models/Feedback.js";

// Ø§Ø±Ø³Ø§Ù„ Ù†Ø¸Ø±/Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯/Ø§Ù†ØªÙ‚Ø§Ø¯
export const createFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.user?._id;

    const feedback = await Feedback.create({
      user: userId,
      type,
      message,
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error("âŒ createFeedback error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ù†Ø¸Ø±" });
  }
};

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø¨Ø§Ø²Ø®ÙˆØ±Ø¯Ù‡Ø§ (ÙÙ‚Ø· Admin)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (err) {
    console.error("âŒ getAllFeedback error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¨Ø§Ø²Ø®ÙˆØ±Ø¯Ù‡Ø§" });
  }
};

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª (Admin)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status, adminNote } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });

    feedback.status = status || feedback.status;
    feedback.adminNote = adminNote || feedback.adminNote;
    await feedback.save();

    res.status(200).json({ success: true, feedback });
  } catch (err) {
    console.error("âŒ updateFeedbackStatus error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª" });
  }
};
