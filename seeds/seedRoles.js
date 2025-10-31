// seeds/seedRoles.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../models/Role.js";

dotenv.config();

const roles = [
  {
    name: "Ø§Ø¯Ù…ÛŒÙ†",
    description: "Ù†Ù‚Ø´ Ú©Ø§Ù…Ù„ Ø¨Ø§ Ù‡Ù…Ù‡ Ø¯Ø³ØªØ±Ø³ÛŒâ€ŒÙ‡Ø§",
    permissions: [
      "role:create", "role:view", "role:update", "role:delete",
      "user:create", "user:view", "user:update", "user:delete",
      "job:create", "job:view", "job:update", "job:delete",
      "notification:create", "notification:view", "notification:update", "notification:delete",
      "applicant:view", "applicant:update"
    ],
  },
  {
    name: "Ú©Ø§Ø±Ø¨Ø±",
    description: "Ú©Ø§Ø±Ø¨Ø± Ø¹Ø§Ø¯ÛŒ Ø¨Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø­Ø¯ÙˆØ¯",
    permissions: ["job:view", "notification:view"],
  },
  {
    name: "Ù…Ø¯ÛŒØ± Ù…Ù†Ø§Ø¨Ø¹ Ø§Ù†Ø³Ø§Ù†ÛŒ",
    description: "Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø¯ÛŒØ±ÛŒØª Ù…ØªÙ‚Ø§Ø¶ÛŒØ§Ù† Ùˆ Ø´ØºÙ„â€ŒÙ‡Ø§",
    permissions: [
      "applicant:view", "applicant:update",
      "job:view", "job:create", "job:update",
      "notification:view", "notification:create"
    ],
  },
  {
    name: "Ù†Ø§Ø¸Ø±",
    description: "ÙÙ‚Ø· Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§",
    permissions: [
      "role:view", "user:view", "job:view", "applicant:view", "notification:view"
    ],
  },
];

const seedRoles = async () => {
  try {
    console.log("ðŸš€ Ø§ØªØµØ§Ù„ Ø¨Ù‡ Ù¾Ø§ÛŒÚ¯Ø§Ù‡â€ŒØ¯Ø§Ø¯Ù‡...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("ðŸ“¦ Ø´Ø±ÙˆØ¹ Ø¹Ù…Ù„ÛŒØ§Øª Ø³Ø§Ø®Øª Ù†Ù‚Ø´â€ŒÙ‡Ø§...");
    for (const role of roles) {
      const exists = await Role.findOne({ name: role.name });

      if (!exists) {
        await Role.create(role);
        console.log(`âœ… Ù†Ù‚Ø´ "${role.name}" Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯.`);
      } else {
        // ðŸ”„ Ø¯Ø± ØµÙˆØ±Øª Ù†ÛŒØ§Ø²ØŒ Ù…ÛŒâ€ŒØªÙˆØ§Ù† Ù…Ø¬ÙˆØ²Ù‡Ø§ Ø±Ø§ Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ú©Ø±Ø¯
        const mergedPerms = Array.from(new Set([...exists.permissions, ...role.permissions]));
        exists.permissions = mergedPerms;
        await exists.save();
        console.log(`ðŸ” Ù†Ù‚Ø´ "${role.name}" Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯.`);
      }
    }

    console.log("ðŸŽ‰ Ø¹Ù…Ù„ÛŒØ§Øª seeding Ù†Ù‚Ø´â€ŒÙ‡Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯.");
    process.exit(0);
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø³Ø§Ø®Øª Ù†Ù‚Ø´â€ŒÙ‡Ø§:", err.message);
    process.exit(1);
  }
};

seedRoles();
