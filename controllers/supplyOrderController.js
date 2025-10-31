//controllers/supplyOrderController.js
import SupplyOrder from "../models/supplyOrderModel.js";

// Ø§ÛŒØ¬Ø§Ø¯ Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§
export const createSupplyOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;
    const userId = req.user._id;

    const supplyOrder = await SupplyOrder.create({ user: userId, items, notes });
    res.status(201).json({ success: true, supplyOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø³ÙØ§Ø±Ø´Ø§Øª (Ø§Ø¯Ù…ÛŒÙ†)
export const getSupplyOrders = async (req, res) => {
  try {
    const orders = await SupplyOrder.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§
export const updateSupplyOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const order = await SupplyOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Ø³ÙØ§Ø±Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    order.status = status || order.status;
    order.history.push({ action: `Status changed to ${status}`, performedBy: userId, date: new Date() });
    await order.save();

    res.status(200).json({ success: true, message: "ÙˆØ¶Ø¹ÛŒØª Ø³ÙØ§Ø±Ø´ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
