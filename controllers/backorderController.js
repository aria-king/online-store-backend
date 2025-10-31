import Backorder from "../models/Backorder.js";

// Ø«Ø¨Øª Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§
export const createBackorder = async (req, res) => {
  try {
    const { productName, quantity, notes } = req.body;
    const userId = req.user._id;

    const backorder = await Backorder.create({
      user: userId,
      productName,
      quantity,
      notes,
    });

    res.status(201).json({ success: true, backorder });
  } catch (err) {
    console.error("âŒ createBackorder error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§" });
  }
};

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§ (Admin)
export const getAllBackorders = async (req, res) => {
  try {
    const backorders = await Backorder.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, backorders });
  } catch (err) {
    console.error("âŒ getAllBackorders error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø³ÙØ§Ø±Ø´â€ŒÙ‡Ø§" });
  }
};

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´ (Admin)
export const updateBackorderStatus = async (req, res) => {
  try {
    const { backorderId } = req.params;
    const { status, adminNote } = req.body;

    const backorder = await Backorder.findById(backorderId);
    if (!backorder) return res.status(404).json({ success: false, message: "Backorder not found" });

    backorder.status = status || backorder.status;
    backorder.adminNote = adminNote || backorder.adminNote;
    await backorder.save();

    res.status(200).json({ success: true, backorder });
  } catch (err) {
    console.error("âŒ updateBackorderStatus error:", err);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª" });
  }
};
