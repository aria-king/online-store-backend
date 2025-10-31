// controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { validationResult } from "express-validator";
import createError from "http-errors";

// 🧩 توابع کمکی JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 🧾 ثبت‌نام کاربر
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError(400, errors.array()));

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(createError(400, "User already exists"));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

// 🔑 ورود کاربر
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(createError(400, "Email and password are required"));

    const user = await User.findOne({ email });
    if (!user) return next(createError(401, "Invalid credentials"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(createError(401, "Invalid credentials"));

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 👤 دریافت پروفایل کاربر
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // فرض می‌کنیم authMiddleware کاربر را attach کرده

    const user = await User.findById(userId).select("-password");
    if (!user) return next(createError(404, "User not found"));

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// ✏️ بروزرسانی پروفایل کاربر
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found"));

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 🗑️ حذف کاربر
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return next(createError(404, "User not found"));

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
