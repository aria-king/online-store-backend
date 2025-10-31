import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * 📜 زیر‌مدل سوابق کاری کاربر
 */
const workHistorySchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, maxlength: 100 },
    role: { type: String, trim: true, maxlength: 100 },
    startDate: Date,
    endDate: Date,
    description: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

/**
 * 👤 مدل اصلی کاربر
 */
const userSchema = new mongoose.Schema(
  {
    // مشخصات فردی
    name: { type: String, required: [true, "نام الزامی است"], trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },

    // اطلاعات تماس
    email: {
      type: String,
      required: [true, "ایمیل الزامی است"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "ایمیل معتبر وارد کنید"],
      index: true,
    },
    phone: {
      type: String,
      match: [/^(?:\+98|0)?9\d{9}$/, "شماره موبایل معتبر نیست"],
      sparse: true,
      unique: true,
    },
    nationalId: { type: String, unique: true, sparse: true, trim: true },

    // امنیت و احراز هویت
    password: {
      type: String,
      required: [true, "رمز عبور الزامی است"],
      minlength: 6,
      select: false,
    },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },

    // نقش‌ها و مجوزها
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    activeRole: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    isSuperAdmin: { type: Boolean, default: false },

    // وضعیت سیستم
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
      index: true,
    },

    // اطلاعات جانبی
    profileImage: { type: String },
    contract: { type: String, trim: true, maxlength: 100 },
    position: { type: String, trim: true, maxlength: 100 },
    workHistory: [workHistorySchema],
    description: { type: String, trim: true, maxlength: 500 },

    // احراز هویت دومرحله‌ای (MFA)
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ["sms", "email"], default: "sms" },
    otpCode: { type: String, select: false },
    otpExpire: { type: Date, select: false },

    // احراز پیشرفته (بیومتریک یا سخت‌افزاری)
    biometricToken: { type: String, select: false },
    hardwareKeyId: { type: String, select: false },

    // دستگاه‌ها و نشست‌ها
    authDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "AdminAuthDevice" }],
    sessionId: { type: String, default: null, index: true },

    // قابلیت چت و تعامل
    chatEnabled: { type: Boolean, default: true },

    // سطح دسترسی مؤثر محاسبه‌شده
    effectivePermissions: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

/* ===============================
   🔐 Middleware & Methods
=============================== */

// هش رمز عبور قبل از ذخیره
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// بررسی رمز عبور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// دریافت همه مجوزهای کاربر
userSchema.methods.getAllPermissions = async function () {
  if (this.isSuperAdmin) return ["*"];
  await this.populate("roles", "permissions");
  const perms = this.roles.flatMap((r) => r.permissions || []);
  this.effectivePermissions = [...new Set(perms)];
  return this.effectivePermissions;
};

// بررسی نقش خاص
userSchema.methods.hasRole = function (roleName) {
  if (this.isSuperAdmin) return true;
  const roleNames = this.roles.map((r) => (r.name || "").toLowerCase());
  return roleNames.includes(roleName.toLowerCase());
};

// بررسی مجوز خاص
userSchema.methods.hasPermission = async function (permission) {
  if (this.isSuperAdmin) return true;
  const perms = await this.getAllPermissions();
  return perms.includes(permission);
};

// خروجی JSON امن
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  delete obj.otpExpire;
  delete obj.biometricToken;
  delete obj.hardwareKeyId;
  return obj;
};

// ایندکس‌ها
userSchema.index({ email: 1, roles: 1 });
userSchema.index({ status: 1, isSuperAdmin: 1 });
userSchema.index({ lastLoginAt: -1 });

// مدل نهایی
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
