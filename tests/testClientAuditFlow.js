// backend/tests/testClientAuditFlow.js
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch"; // âœ… Ù…Ø³ØªÙ‚ÛŒÙ… Ø§ÛŒÙ…Ù¾ÙˆØ±Øª Ù…ÛŒâ€ŒÚ©Ù†ÛŒÙ… ØªØ§ dynamic import Ù„Ø§Ø²Ù… Ù†Ø¨Ø§Ø´Ù‡

import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";
import { createRole } from "../controllers/roleController.js";
import Role from "../models/Role.js";
import User from "../models/userModel.js"; // âœ… Ù…Ø³ÛŒØ± Ø¯Ø±Ø³Øª (Ù†Ø³Ø¨ÛŒ Ùˆ Ø¨Ø§ .js)
import AuditLog from "../models/AuditLog.js";

dotenv.config();

const app = express();
app.use(express.json());

// ðŸ§© Ø§Ø¶Ø§ÙÙ‡ Ú©Ø±Ø¯Ù† middlewareÙ‡Ø§ Ø¨Ù‡ ØªØ±ØªÛŒØ¨
app.use(clientInfoMiddleware);
app.use(protect);
app.use(auditMiddleware("Role", "create"));

// ðŸ“Œ Ù…Ø³ÛŒØ± ØªØ³Øª Ø¨Ø±Ø§ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´
app.post("/test/create-role", async (req, res) => {
  await createRole(req, res);
});

// ðŸŽ¯ ØªØ§Ø¨Ø¹ Ø§ØµÙ„ÛŒ ØªØ³Øª
const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("âœ… Ù…ØªØµÙ„ Ø¨Ù‡ MongoDB");

    // 1ï¸âƒ£ Ú©Ø§Ø±Ø¨Ø± ØªØ³ØªÛŒ
    let user = await User.findOne({ email: "testadmin@example.com" });
    if (!user) {
      user = await User.create({
        name: "Test",
        lastName: "Admin",
        email: "testadmin@example.com",
        password: "123456",
        isSuperAdmin: true,
        status: "active",
      });
    }

    // 2ï¸âƒ£ Ø³Ø§Ø®Øª ØªÙˆÚ©Ù† JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 3ï¸âƒ£ Ø§Ø±Ø³Ø§Ù„ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ù‡ Ø³Ø±ÙˆØ± ØªØ³Øª
    const response = await fetch("http://localhost:5001/test/create-role", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Chrome 130.0.6723)",
        "x-forwarded-for": "192.168.0.10",
      },
      body: JSON.stringify({
        name: "qa-tester",
        permissions: ["role:read", "role:update"],
        description: "Ù†Ù‚Ø´ ØªØ³Øª Ø³ÛŒØ³ØªÙ… Ù„Ø§Ú¯",
      }),
    });

    const data = await response.json();
    console.log("ðŸ“© Ù¾Ø§Ø³Ø® API:", data);

    // 4ï¸âƒ£ Ø¨Ø±Ø±Ø³ÛŒ Ù„Ø§Ú¯ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù‡ Ø¯Ø± Ø¯ÛŒØªØ§Ø¨ÛŒØ³
    const audit = await AuditLog.findOne({ entityType: "Role" }).sort({ createdAt: -1 });
    if (audit) {
      console.log("ðŸ§¾ Ù„Ø§Ú¯ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ø¯ÛŒØªØ§Ø¨ÛŒØ³:");
      console.log({
        action: audit.action,
        user: audit.changedBy,
        ip: audit.ip,
        url: audit.meta?.url,
        createdAt: audit.createdAt,
      });
    } else {
      console.warn("âš ï¸ Ù„Ø§Ú¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯!");
    }

    await mongoose.disconnect();
    console.log("ðŸŸ¢ ØªØ³Øª Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯.");
    process.exit(0);
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± ØªØ³Øª:", err);
    process.exit(1);
  }
};

// ðŸš€ Ø§Ø¬Ø±Ø§ÛŒ Ø³Ø±ÙˆØ± ØªØ³Øª
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`ðŸš€ Ø³Ø±ÙˆØ± ØªØ³Øª Ø±ÙˆÛŒ Ù¾ÙˆØ±Øª ${PORT} ÙØ¹Ø§Ù„ Ø§Ø³Øª`);
  setTimeout(runTest, 1500);
});
