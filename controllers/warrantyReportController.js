//controllers/warrantyReportController.js
import Warranty from "../models/Warranty.js";

// ðŸ“Š Ø¢Ù…Ø§Ø± Ú©Ù„ÛŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒâ€ŒÙ‡Ø§
export const getWarrantyStats = async (req, res) => {
  try {
    const total = await Warranty.countDocuments();
    const valid = await Warranty.countDocuments({ status: "valid" });
    const expired = await Warranty.countDocuments({ status: "expired" });
    const rejected = await Warranty.countDocuments({ status: "rejected" });

    res.json({ total, valid, expired, rejected });
  } catch (err) {
    console.error("âŒ getWarrantyStats error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…Ø§Ø± Ú¯Ø§Ø±Ø§Ù†ØªÛŒâ€ŒÙ‡Ø§" });
  }
};

// ðŸ“Š Ú¯Ø²Ø§Ø±Ø´ ØªØ¹Ø¯Ø§Ø¯ Ø¯ÙØ¹Ø§Øª Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
export const getWarrantyUsageStats = async (req, res) => {
  try {
    const stats = await Warranty.aggregate([
      { $unwind: "$usageHistory" },
      {
        $group: {
          _id: "$usageHistory.decision",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error("âŒ getWarrantyUsageStats error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…Ø§Ø± Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ú¯Ø§Ø±Ø§Ù†ØªÛŒ" });
  }
};

// ðŸ“Š Ú¯Ø²Ø§Ø±Ø´ Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ (Ø±Ø§ÛŒÚ¯Ø§Ù†ØŒ Ø¨Ø®Ø´ÛŒØŒ Ú©Ø§Ù…Ù„)
export const getWarrantyCostStats = async (req, res) => {
  try {
    const stats = await Warranty.aggregate([
      { $unwind: "$usageHistory" },
      {
        $group: {
          _id: "$usageHistory.costType",
          totalAmount: { $sum: "$usageHistory.costAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error("âŒ getWarrantyCostStats error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ú¯Ø²Ø§Ø±Ø´ Ù‡Ø²ÛŒÙ†Ù‡ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ" });
  }
};

// ðŸ“Š Ú¯Ø²Ø§Ø±Ø´ Ø±Ø´Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø¨Ø± Ø§Ø³Ø§Ø³ Ù…Ø§Ù‡
export const getWarrantyGrowth = async (req, res) => {
  try {
    const growth = await Warranty.aggregate([
      { $unwind: "$usageHistory" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$usageHistory.usedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(growth);
  } catch (err) {
    console.error("âŒ getWarrantyGrowth error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ú¯Ø±ÙØªÙ† Ø±Ø´Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ" });
  }
};

// ðŸ“Š Ú©Ø§Ù„Ø§Ù‡Ø§ÛŒÛŒ Ø¨Ø§ Ø¨ÛŒØ´ØªØ±ÛŒÙ† Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
export const getTopWarrantyProducts = async (req, res) => {
  try {
    const stats = await Warranty.aggregate([
      { $unwind: "$usageHistory" },
      {
        $group: {
          _id: "$product",
          usageCount: { $sum: 1 },
        },
      },
      { $sort: { usageCount: -1 } },
      { $limit: 10 },
    ]);

    res.json(stats);
  } catch (err) {
    console.error("âŒ getTopWarrantyProducts error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ú©Ø§Ù„Ø§Ù‡Ø§ÛŒ Ù¾Ø±Ù…ØµØ±Ù Ø¯Ø± Ú¯Ø§Ø±Ø§Ù†ØªÛŒ" });
  }
};
