//routes/supplyOrderRoutes.js
import express from "express";
import { createSupplyOrder, getSupplyOrders, updateSupplyOrderStatus } from "../controllers/supplyOrderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSupplyOrder); // Ø§Ø±Ø³Ø§Ù„ Ø³ÙØ§Ø±Ø´ ØªØ§Ù…ÛŒÙ† Ú©Ø§Ù„Ø§
router.get("/", protect, adminOnly, getSupplyOrders); // Ø¯Ø±ÛŒØ§ÙØª Ù‡Ù…Ù‡ Ø³ÙØ§Ø±Ø´Ø§Øª
router.put("/:id/status", protect, adminOnly, updateSupplyOrderStatus); // Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª

export default router;
