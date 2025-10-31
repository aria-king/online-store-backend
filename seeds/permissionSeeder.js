import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.js";

dotenv.config();

const permissions = [
  // ðŸ·ï¸ Tag Permissions
  "tag:create",
  "tag:read",
  "tag:update",
  "tag:delete",
  // ðŸ‘¤ User Permissions
  "user:create",
  "user:read",
  "user:update",
  "user:delete",

  // ðŸ“Œ Role Permissions
  "role:create",
  "role:read",
  "role:update",
  "role:delete",

  // ðŸ“Œ Job Permissions
  "job:create",
  "job:read",
  "job:update",
  "job:delete",

  // ðŸ”” Notification Permissions
  "notification:create",
  "notification:read",
  "notification:update",
  "notification:delete",

  // ðŸ›¡ï¸ Audit Logs
  "audit:read",
];

const seedPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("ðŸš€ Ø´Ø±ÙˆØ¹ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´â€ŒÙ‡Ø§ Ùˆ Ø¯Ø³ØªØ±Ø³ÛŒâ€ŒÙ‡Ø§...");

    // 1. Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø§ Ù‡Ù…Ù‡ Ø¯Ø³ØªØ±Ø³ÛŒâ€ŒÙ‡Ø§
    let adminRole = await Role.findOne({ name: "Ø§Ø¯Ù…ÛŒÙ†" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "Ø§Ø¯Ù…ÛŒÙ†",
        description: "Ù…Ø¯ÛŒØ±ÛŒØª Ú©Ø§Ù…Ù„ Ø³ÛŒØ³ØªÙ…",
        permissions,
      });
      console.log("âœ… Ù†Ù‚Ø´ Ø§Ø¯Ù…ÛŒÙ† Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯");
    } else {
      adminRole.permissions = permissions;
      await adminRole.save();
      console.log("âœ… Ù†Ù‚Ø´ Ø§Ø¯Ù…ÛŒÙ† Ø¨Ø±ÙˆØ² Ø´Ø¯");
    }

    // 2. Ú©Ø§Ø±Ø¨Ø± Ø¹Ø§Ø¯ÛŒ Ø¨Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø­Ø¯ÙˆØ¯
    let userRole = await Role.findOne({ name: "Ú©Ø§Ø±Ø¨Ø±" });
    if (!userRole) {
      userRole = await Role.create({
        name: "Ú©Ø§Ø±Ø¨Ø±",
        description: "Ú©Ø§Ø±Ø¨Ø± Ø¹Ø§Ø¯ÛŒ Ø¨Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø­Ø¯ÙˆØ¯",
        permissions: ["job:read", "notification:read"],
      });
      console.log("âœ… Ù†Ù‚Ø´ Ú©Ø§Ø±Ø¨Ø± Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯");
    }

    // 3. Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ
    let supportRole = await Role.findOne({ name: "Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ" });
    if (!supportRole) {
      supportRole = await Role.create({
        name: "Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ",
        description: "Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø¨Ø®Ø´ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ",
        permissions: ["user:read", "notification:read", "notification:update"],
      });
      console.log("âœ… Ù†Ù‚Ø´ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯");
    }

    console.log("ðŸŽ‰ Seeder Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ø¬Ø±Ø§ Ø´Ø¯!");
    process.exit();
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø§Ø¬Ø±Ø§ÛŒ Seeder:", err);
    process.exit(1);
  }
};

seedPermissions();
