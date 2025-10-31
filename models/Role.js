import mongoose from "mongoose";

/**
 * 🎭 Role Schema
 * ---------------------------------------------------------
 * - پشتیبانی از نقش‌های سلسله‌مراتبی (parentRole)
 * - سازگار با permissionMiddleware و auditTrail
 * - شامل متدهای کاربردی برای بررسی مجوز و ارث‌بری نقش والد
 */

const roleSchema = new mongoose.Schema(
  {
    // 🎯 نام نقش (یونیک، اجباری، حروف کوچک)
    name: {
      type: String,
      required: [true, "نام نقش الزامی است"],
      unique: true, // ✅ یونیک بودن حفظ می‌شود
      trim: true,
      lowercase: true,
    },

    // 🔗 نقش والد
    parentRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
      index: true,
    },

    // 📝 توضیح نقش
    description: { type: String, default: "", trim: true },

    // 🧩 فهرست مجوزها
    permissions: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    ],

    // 👤 ایجادکننده نقش
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ⚙️ نقش سیستمی
    isSystem: { type: Boolean, default: false, index: true },

    // 🟢 وضعیت فعال بودن
    isActive: { type: Boolean, default: true, index: true },

    // 📊 تعداد کاربران مرتبط
    userCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ===========================================================
   📚 ایندکس‌ها برای جستجو و عملکرد بهتر
=========================================================== */
// ❌ حذف شد: roleSchema.index({ name: 1 }, { unique: true }); ← باعث هشدار تکراری می‌شد
roleSchema.index({ isSystem: 1, isActive: 1 });
roleSchema.index({ parentRole: 1, name: 1 });
roleSchema.index({ createdAt: -1 });

/* ===========================================================
   ⚙️ متدهای کاربردی
=========================================================== */
roleSchema.methods.hasPermission = function (permission) {
  if (!permission) return false;
  return this.permissions?.includes(permission.toLowerCase());
};

roleSchema.methods.getAllPermissions = async function () {
  const collected = new Set(this.permissions || []);
  if (this.parentRole) {
    const parent = await this.model("Role").findById(this.parentRole);
    if (parent) {
      const parentPerms = await parent.getAllPermissions();
      parentPerms.forEach((p) => collected.add(p));
    }
  }
  return [...collected];
};

roleSchema.virtual("permissionsCount").get(function () {
  return this.permissions?.length || 0;
});

/* ===========================================================
   🧹 پاکسازی و جلوگیری از خطاهای رایج
=========================================================== */
roleSchema.pre("deleteOne", { document: true, query: false }, function (next) {
  if (this.isSystem) {
    const err = new Error(`❌ نقش سیستمی "${this.name}" قابل حذف نیست.`);
    err.statusCode = 400;
    return next(err);
  }
  next();
});

roleSchema.pre("save", function (next) {
  if (Array.isArray(this.permissions) && this.permissions.length > 0) {
    this.permissions = [
      ...new Set(this.permissions.map((p) => p.toLowerCase().trim())),
    ].sort();
  }
  next();
});

/* ===========================================================
   🧱 خروجی JSON تمیز و امن
=========================================================== */
roleSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

/* ===========================================================
   ✅ مدل نهایی
=========================================================== */
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
export default Role;
