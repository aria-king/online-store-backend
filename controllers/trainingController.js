import TrainingContent from "../models/TrainingContent.js";

// Ø§ÛŒØ¬Ø§Ø¯ Ø¢Ù…ÙˆØ²Ø´
export const createTrainingContent = async (req, res) => {
  try {
    const files = req.files || {};
    let url = null;
    if (files.file?.[0]) url = `/uploads/training/${files.file[0].filename}`;

    const content = await TrainingContent.create({
      ...req.body,
      url,
      createdBy: req.user._id
    });

    res.status(201).json(content);
  } catch (err) {
    console.error("âŒ createTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ø¢Ù…ÙˆØ²Ø´" });
  }
};

// Ù„ÛŒØ³Øª Ø¢Ù…ÙˆØ²Ø´â€ŒÙ‡Ø§ (ÙÛŒÙ„ØªØ± Ø¨Ø± Ø§Ø³Ø§Ø³ Ù†Ù‚Ø´)
export const getTrainingList = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "technician" || req.user.role === "installer") {
      filter.type = req.query.type || null;
    }
    const list = await TrainingContent.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("âŒ getTrainingList error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…ÙˆØ²Ø´â€ŒÙ‡Ø§" });
  }
};

// Ø¬Ø²Ø¦ÛŒØ§Øª Ø¢Ù…ÙˆØ²Ø´
export const getTrainingById = async (req, res) => {
  try {
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ø¢Ù…ÙˆØ²Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    res.json(content);
  } catch (err) {
    console.error("âŒ getTrainingById error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…ÙˆØ²Ø´" });
  }
};

// ÙˆÛŒØ±Ø§ÛŒØ´ Ø¢Ù…ÙˆØ²Ø´
export const updateTrainingContent = async (req, res) => {
  try {
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ø¢Ù…ÙˆØ²Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    Object.assign(content, req.body);
    await content.save();
    res.json(content);
  } catch (err) {
    console.error("âŒ updateTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø¢Ù…ÙˆØ²Ø´" });
  }
};

// Ø­Ø°Ù Ø¢Ù…ÙˆØ²Ø´
export const deleteTrainingContent = async (req, res) => {
  try {
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Ø¢Ù…ÙˆØ²Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    await content.deleteOne();
    res.json({ message: "Ø¢Ù…ÙˆØ²Ø´ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteTrainingContent error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø¢Ù…ÙˆØ²Ø´" });
  }
};
