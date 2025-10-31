import Ticket from "../models/Ticket.js";
import User from "../models/userModel.js";
import { createNotification } from "../services/notificationService.js";

// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¬Ø¯ÛŒØ¯ ØªÙˆØ³Ø· Ù…Ø´ØªØ±ÛŒ
export const createTicket = async (req, res) => {
  try {
    const { product, serviceType, description, province, city, address } = req.body;

    const ticket = await Ticket.create({
      customer: req.user._id,
      product,
      serviceType,
      description,
      province,
      city,
      address,
      status: "pending",
      history: [{ status: "pending", changedBy: req.user._id, note: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯" }],
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error("âŒ createTicket error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§
export const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceType } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    // Ø§Ú¯Ø± Ù…Ø´ØªØ±ÛŒ Ù‡Ø³ØªØŒ ÙÙ‚Ø· Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ¯Ø´
    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    }

    // Ø§Ú¯Ø± ØªÚ©Ù†Ø³ÛŒÙ† Ù‡Ø³ØªØŒ ÙÙ‚Ø· Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ø®ØªØµØ§Øµ Ø¯Ø§Ø¯Ù‡ Ø´Ø¯Ù‡
    if (req.user.role === "technician") {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email");

    const total = await Ticket.countDocuments(filter);

    res.json({ results: tickets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("âŒ getTickets error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ø¯Ø±Ø®ÙˆØ§Ø³Øª
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email");

    if (!ticket) return res.status(404).json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // Ù…Ø­Ø¯ÙˆØ¯ Ú©Ø±Ø¯Ù† Ø¯Ø³ØªØ±Ø³ÛŒ
    if (req.user.role === "customer" && ticket.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    if (req.user.role === "technician" && ticket.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("âŒ getTicketById error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª" });
  }
};

// ðŸ“Œ Ø§Ø®ØªØµØ§Øµ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ù‡ ØªÚ©Ù†Ø³ÛŒÙ†/Ù†ØµØ§Ø¨
export const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { technicianId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    ticket.assignedTo = technicianId;
    ticket.status = "assigned";
    ticket.history.push({ status: "assigned", changedBy: req.user._id, note: "ØªØ®ØµÛŒØµ ØªÚ©Ù†Ø³ÛŒÙ†" });
    await ticket.save();

    await createNotification(technicianId, "service", `Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ Ø¨Ù‡ Ø´Ù…Ø§ Ø§Ø®ØªØµØ§Øµ ÛŒØ§ÙØª`, { ticket: ticket._id });

    res.json(ticket);
  } catch (err) {
    console.error("âŒ assignTicket error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø®ØªØµØ§Øµ Ø¯Ø±Ø®ÙˆØ§Ø³Øª" });
  }
};

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª (ØªÚ©Ù†Ø³ÛŒÙ† ÛŒØ§ Ù…Ø¯ÛŒØ±)
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, note } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø­Ø¯ÙˆØ¯: ØªÚ©Ù†Ø³ÛŒÙ† ÙÙ‚Ø· Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø®ÙˆØ¯Ø´
    if (req.user.role === "technician" && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    ticket.status = status;
    ticket.history.push({ status, changedBy: req.user._id, note });
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error("âŒ updateTicketStatus error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª" });
  }
};

// ðŸ“Œ Ø­Ø°Ù Ø¯Ø±Ø®ÙˆØ§Ø³Øª (Ù…Ø¯ÛŒØ± ÛŒØ§ Ù…Ø´ØªØ±ÛŒ Ø®ÙˆØ¯Ø´)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    if (req.user.role !== "admin" && ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯" });
    }

    await ticket.deleteOne();
    res.json({ message: "Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø­Ø°Ù Ø´Ø¯" });
  } catch (err) {
    console.error("âŒ deleteTicket error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ø¯Ø±Ø®ÙˆØ§Ø³Øª" });
  }
};
