// models/AdminAuthDevice.js
import mongoose from "mongoose";

const adminAuthDeviceSchema = new mongoose.Schema(
  {
    // 👤 شناسه کاربر مرتبط
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📱 نام دستگاه (مثلاً: iPhone 14, MacBook Pro)
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },

    // ⚙️ نوع دستگاه (کلید سخت‌افزاری یا بیومتریک)
    deviceType: {
      type: String,
      enum: ["hardware", "biometric"],
      required: true,
    },

    // 🔑 مخصوص کلید سخت‌افزاری (WebAuthn / FIDO2)
    publicKey: {
      type: String,
      default: null,
    },
    credentialId: {
      type: String,
      default: null,
    },

    // 🧬 مخصوص دستگاه بیومتریک
    biometricType: {
      type: String,
      enum: ["fingerprint", "faceid", "pattern"],
      default: null,
    },
    biometricToken: {
      type: String, // توکن رمزنگاری‌شده (مثلاً JWT یا WebAuthn challenge)
      default: null,
    },

    // ⏱ زمان آخرین استفاده
    lastUsedAt: {
      type: Date,
      default: null,
    },

    // 📅 زمان ایجاد
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // ✅ وضعیت فعال یا غیرفعال
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // به‌صورت خودکار createdAt و updatedAt را اضافه می‌کند
);

const AdminAuthDevice =
  mongoose.models.AdminAuthDevice ||
  mongoose.model("AdminAuthDevice", adminAuthDeviceSchema);

export default AdminAuthDevice;
