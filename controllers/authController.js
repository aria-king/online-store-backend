// controllers/authController.js
import createError from "http-errors";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Role from "../models/Role.js";
import { createNotification } from "../services/notificationService.js";
import { logAudit } from "../services/auditService.js";

/**
 * ðŸ” Helper: Ø³Ø§Ø®Øª JWT (Ø¨Ø§ payload Ú©Ø§Ù…Ù„â€ŒØªØ±)
 */
const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    roles: (user.roles || []).map((r) =>
      typeof r === "object" ? r._id || r.name : r
    ),
    isSuperAdmin: !!user.isSuperAdmin,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * âœ… Register User (Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…)
 * ------------------------------------------------------------
 * - Ø§Ø² clientInfoMiddleware Ø¨Ø±Ø§ÛŒ Ø«Ø¨Øª IP Ùˆ UserAgent Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
 * - Ø§Ø² auditTrail Ø¨Ø±Ø§ÛŒ Ø«Ø¨Øª Ø¹Ù…Ù„ÛŒØ§Øª Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, lastName, email, password, roles: inputRoles, role } = req.body;
    if (!email || !password)
      return next(createError(400, "Email and password are required"));

    const existing = await User.findOne({ email });
    if (existing) return next(createError(409, "User already exists"));

    let rolesToSet = [];
    if (Array.isArray(inputRoles) && inputRoles.length) {
      rolesToSet = inputRoles;
    } else if (role) {
      rolesToSet = [role];
    }

    const userPayload = {
      name,
      lastName,
      email,
      password, // Ù‡Ø´ Ø¯Ø± Ù…Ø¯Ù„ userModel
      roles: rolesToSet,
      status: "active",
    };

    if (req.file?.path) userPayload.profileImage = req.file.path;

    const user = await User.create(userPayload);

    await logAudit({
      entityType: "User",
      entityId: user._id,
      action: "create",
      changedBy: user._id,
      notes: "User registered successfully",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { url: req.originalUrl },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("âŒ [registerUser] Error:", err);
    next(createError(500, "Registration failed"));
  }
};

/**
 * âœ… Login User
 * ------------------------------------------------------------
 * - Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø§Ø² Ù†Ù‚Ø´â€ŒÙ‡Ø§ Ùˆ Ø³Ø·Ø­ Ø¯Ø³ØªØ±Ø³ÛŒ
 * - Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø§Ø² Ø§Ø­Ø±Ø§Ø² Ú†Ù†Ø¯Ù…Ø±Ø­Ù„Ù‡â€ŒØ§ÛŒ Ø¨Ø±Ø§ÛŒ Ø§Ø¯Ù…ÛŒÙ†â€ŒÙ‡Ø§
 * - Ø«Ø¨Øª Ù„Ø§Ú¯ Ø¯Ø± Ø³ÛŒØ³ØªÙ… AuditTrail
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, deviceType } = req.body;
    if (!email || !password)
      return next(createError(400, "Email and password are required"));

    const user = await User.findOne({ email })
      .select("+password +biometricToken +hardwareKeyId")
      .populate("roles", "name permissions");

    if (!user) return next(createError(401, "Invalid credentials"));

    const valid = await user.matchPassword(password);
    if (!valid) return next(createError(401, "Invalid credentials"));

    const roles = user.roles?.map((r) => r.name) || [];
    const isAdmin = user.isSuperAdmin || roles.includes("admin");

    if (isAdmin) {
      const method =
        deviceType === "desktop" || deviceType === "laptop"
          ? "hardware"
          : "biometric";
      return res.json({
        success: true,
        mfaRequired: true,
        method,
        message:
          method === "hardware"
            ? "Hardware key verification required"
            : "Biometric verification required",
        userId: user._id,
      });
    }

    const token = generateToken(user);

    await logAudit({
      entityType: "User",
      entityId: user._id,
      action: "login",
      changedBy: user._id,
      notes: "User logged in",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { url: req.originalUrl, method: "password" },
    });

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.otpCode;
    delete safeUser.otpExpire;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error("âŒ [loginUser] Error:", err);
    next(createError(500, "Login failed"));
  }
};

/**
 * âœ… Verify Hardware Key (Ø¨Ø±Ø§ÛŒ MFA Ø¯Ø± Ø¯Ø³Ú©ØªØ§Ù¾)
 */
export const verifyHardwareKey = async (req, res, next) => {
  try {
    const { userId, hardwareKeyAssertion } = req.body;
    if (!userId || !hardwareKeyAssertion)
      return next(createError(400, "Missing parameters"));

    const user = await User.findById(userId).select("+hardwareKeyId");
    if (!user) return next(createError(404, "User not found"));

    if (user.hardwareKeyId !== hardwareKeyAssertion.id) {
      return next(createError(401, "Hardware key verification failed"));
    }

    const token = generateToken(user);

    await logAudit({
      entityType: "User",
      entityId: user._id,
      action: "login",
      changedBy: user._id,
      notes: "Hardware MFA verified",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { method: "hardware" },
    });

    res.json({ success: true, message: "Hardware key verified", token });
  } catch (err) {
    console.error("âŒ [verifyHardwareKey] Error:", err);
    next(createError(500, "Hardware verification failed"));
  }
};

/**
 * âœ… Verify Biometric (Ø¨Ø±Ø§ÛŒ Ù…ÙˆØ¨Ø§ÛŒÙ„)
 */
export const verifyBiometric = async (req, res, next) => {
  try {
    const { userId, biometricAssertion } = req.body;
    if (!userId || !biometricAssertion)
      return next(createError(400, "Missing parameters"));

    const user = await User.findById(userId).select("+biometricToken");
    if (!user) return next(createError(404, "User not found"));

    if (user.biometricToken !== biometricAssertion.token) {
      return next(createError(401, "Biometric verification failed"));
    }

    const token = generateToken(user);

    await logAudit({
      entityType: "User",
      entityId: user._id,
      action: "login",
      changedBy: user._id,
      notes: "Biometric MFA verified",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { method: "biometric" },
    });

    res.json({ success: true, message: "Biometric verified", token });
  } catch (err) {
    console.error("âŒ [verifyBiometric] Error:", err);
    next(createError(500, "Biometric verification failed"));
  }
};

/**
 * âœ… Logout User
 */
export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    await logAudit({
      entityType: "User",
      entityId: userId,
      action: "logout",
      changedBy: userId,
      notes: "User logged out",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("âŒ [logoutUser] Error:", err);
    next(createError(500, "Logout failed"));
  }
};
