//controllers/suggestionController.js
import Suggestion from "../models/suggestionModel.js";

// Ø§ÛŒØ¬Ø§Ø¯ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯/Ù†Ø¸Ø±/Ø§Ù†ØªÙ‚Ø§Ø¯
export const createSuggestion = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.user._id;

    const suggestion = await Suggestion.create({ user: userId, type, message });
    res.status(201).json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯Ù‡Ø§ (Ø§Ø¯Ù…ÛŒÙ†)
export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ùˆ Ù¾Ø§Ø³Ø® Ø¨Ù‡ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯
export const updateSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userId = req.user._id;

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) return res.status(404).json({ success: false, message: "Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (status) suggestion.status = status;
    if (response) suggestion.response = { ...response, respondedBy: userId, date: new Date() };

    suggestion.history.push({ action: `Updated by admin`, performedBy: userId, date: new Date() });
    await suggestion.save();

    res.status(200).json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
