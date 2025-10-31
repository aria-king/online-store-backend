import ProductExpertise from "../models/productExpertiseModel.js";
import Product from "../models/productModel.js";

// ðŸ“Œ Ø«Ø¨Øª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ Ø¬Ø¯ÛŒØ¯
export const addExpertise = async (req, res) => {
  try {
    const { productId, description, rating, files } = req.body;

    const expertise = await ProductExpertise.create({
      product: productId,
      expert: req.user._id,
      description,
      rating,
      files,
    });

    res.status(201).json(expertise);
  } catch (err) {
    console.error("âŒ addExpertise error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø«Ø¨Øª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒâ€ŒÙ‡Ø§ÛŒ ÛŒÚ© Ù…Ø­ØµÙˆÙ„
export const getProductExpertise = async (req, res) => {
  try {
    const { productId } = req.params;

    const expertises = await ProductExpertise.find({ product: productId })
      .populate("expert", "name lastName email")
      .sort({ createdAt: -1 });

    res.json(expertises);
  } catch (err) {
    console.error("âŒ getProductExpertise error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒâ€ŒÙ‡Ø§" });
  }
};

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ (ÙÙ‚Ø· ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ±)
export const updateExpertiseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "ÙˆØ¶Ø¹ÛŒØª Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª" });
    }

    const expertise = await ProductExpertise.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(expertise);
  } catch (err) {
    console.error("âŒ updateExpertiseStatus error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ" });
  }
};

// ðŸ“Œ Ø­Ø°Ù Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ (Ù…Ø¯ÛŒØ± ÛŒØ§ Ú©Ø§Ø±Ø´Ù†Ø§Ø³ Ø«Ø¨Øªâ€ŒÚ©Ù†Ù†Ø¯Ù‡)
export const deleteExpertise = async (req, res) => {
  try {
    const { id } = req.params;

    const expertise = await ProductExpertise.findById(id);
    if (!expertise) {
      return res.status(404).json({ message: "Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    }

    if (
      expertise.expert.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ ØºÛŒØ±Ù…Ø¬Ø§Ø²" });
    }

    await expertise.deleteOne();

    res.json({ message: "Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteExpertise error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ú©Ø§Ø±Ø´Ù†Ø§Ø³ÛŒ" });
  }
};
