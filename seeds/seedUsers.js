import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Role from "../models/Role.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Ú¯Ø±ÙØªÙ† Ù†Ù‚Ø´ "Ø§Ø¯Ù…ÛŒÙ†"
    const adminRole = await Role.findOne({ name: "Ø§Ø¯Ù…ÛŒÙ†" });
    if (!adminRole) {
      console.error("âŒ Ù†Ù‚Ø´ 'Ø§Ø¯Ù…ÛŒÙ†' ÛŒØ§ÙØª Ù†Ø´Ø¯. Ù„Ø·ÙØ§Ù‹ Ø§ÙˆÙ„ seedRoles.js Ø±Ø§ Ø§Ø¬Ø±Ø§ Ú©Ù†ÛŒØ¯.");
      process.exit(1);
    }

    // Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ¬ÙˆØ¯ Ø³ÙˆÙ¾Ø±Ø§Ø¯Ù…ÛŒÙ†
    const exists = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (exists) {
      console.log("â„¹ï¸ Ø³ÙˆÙ¾Ø±Ø§Ø¯Ù…ÛŒÙ† Ø§Ø² Ù‚Ø¨Ù„ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ø¯:", exists.email);
      process.exit(0);
    }

    // Ù‡Ø´ Ú©Ø±Ø¯Ù† Ù¾Ø³ÙˆØ±Ø¯
    const hashedPass = await bcrypt.hash(process.env.SUPER_ADMIN_PASS, 10);

    // Ø³Ø§Ø®Øª Ø³ÙˆÙ¾Ø±Ø§Ø¯Ù…ÛŒÙ†
    const superAdmin = await User.create({
      name: "Super",
      lastName: "Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPass,
      role: adminRole.name,   // Ø§Ø³Ù… Ù†Ù‚Ø´ (Ø§Ø¯Ù…ÛŒÙ†)
      roleId: adminRole._id,  // Ø±ÛŒÙØ±Ù†Ø³ Ø¨Ù‡ Role
      status: "active",
      isVerified: true,
    });

    console.log(`âœ… Ø³ÙˆÙ¾Ø±Ø§Ø¯Ù…ÛŒÙ† Ø³Ø§Ø®ØªÙ‡ Ø´Ø¯: ${superAdmin.email}`);
    process.exit(0);
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø³Ø§Ø®Øª Ø³ÙˆÙ¾Ø±Ø§Ø¯Ù…ÛŒÙ†:", err);
    process.exit(1);
  }
};

seedUsers();
