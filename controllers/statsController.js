import User from "../models/userModel.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getStats = async (req, res) => {
  try {
    // Ø´Ù…Ø§Ø±Ø´ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†
    const usersCount = await User.countDocuments();

    // Ø´Ù…Ø§Ø±Ø´ Ø³ÙØ§Ø±Ø´Ø§Øª
    const ordersCount = await Order.countDocuments();

    // Ø´Ù…Ø§Ø±Ø´ Ù…Ø­ØµÙˆÙ„Ø§Øª
    const productsCount = await Product.countDocuments();

    // Ø¬Ù…Ø¹ ÙØ±ÙˆØ´ Ú©Ù„
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.json({
      usersCount,
      ordersCount,
      productsCount,
      revenue: totalSales[0]?.total || 0, // âœ… ØªØºÛŒÛŒØ± Ø¨Ù‡ revenue
    });
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…Ø§Ø±:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¢Ù…Ø§Ø±" });
  }
};
