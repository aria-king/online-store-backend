// models/AuditLog.js
import mongoose from "mongoose";

/**
 * AuditLog Schema — هماهنگ با auditService و auditMiddleware
 *
 * توضیح: برخی فیلدها index: true بودند و همان‌ها دوباره با schema.index(...) اضافه شده بودند.
 *      برای جلوگیری از هشدارهای Mongoose (Duplicate schema index)،
 *      از تعریف ایندکس تکراری پرهیز شده است.
 */
const auditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
      // اگر نیاز به ایندکس ترکیبی با action دارید، از schema.index({entityType:1, action:1}) استفاده شده است
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // اگر خواستید می‌توانید این فیلد را ایندکس کنید: index: true
    },

    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "create",
        "update",
        "delete",
        "view",
        "login",
        "logout",
        "status_change",
        "assign",
        "unassign",
        "upload",
        "download",
        "permission_change",
        "multi_role_update",
        "auth_context_change",
        "system_event",
        "unknown",
      ],
      // توجه: این فیلد در ایندکس ترکیبیِ پایین استفاده می‌شود
    },

    severity: {
      type: String,
      enum: ["normal", "info", "warning", "critical"],
      default: "normal",
      // در صورت نیاز به ایندکس جداگانه می‌توان index: true اضافه کرد
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      // مهم: اینجا index:true حذف شد تا از تعریف ایندکس تکراری جلوگیری شود.
      // اگر می‌خواهید ایندکس مستقیم روی changedBy داشته باشید،
      // از schema.index({ changedBy: 1 }) فقط در یک محل استفاده کنید.
    },

    activeRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        // آرایه‌ها معمولاً ایندکس مستقیم نمی‌گیرند مگر صراحتاً نیاز باشد
      },
    ],

    from: { type: mongoose.Schema.Types.Mixed, default: null },
    to: { type: mongoose.Schema.Types.Mixed, default: null },

    notes: { type: String, trim: true, default: "" },

    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    authContext: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
      permissions: [String],
      verified: { type: Boolean, default: false },
      isSuperAdmin: { type: Boolean, default: false },
      sessionId: { type: String, default: null },
    },

    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ایندکس‌های مفید و غیرتکراری
auditLogSchema.index({ entityType: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ "authContext.userId": 1 });
auditLogSchema.index({ "authContext.roles": 1 });
auditLogSchema.index({ "meta.traceId": 1 });

// اگر می‌خواهید ایندکس مستقیم changedBy داشته باشید، از این خط (یک بار) استفاده کنید:
// auditLogSchema.index({ changedBy: 1 });

if (process.env.AUDIT_LOG_EXPIRE_DAYS) {
  auditLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: parseInt(process.env.AUDIT_LOG_EXPIRE_DAYS, 10) * 86400 }
  );
}

auditLogSchema.methods.summary = function () {
  return {
    id: this._id,
    entityType: this.entityType,
    action: this.action,
    changedBy: this.changedBy,
    severity: this.severity,
    roles: this.activeRoles,
    ip: this.ip,
    createdAt: this.createdAt,
    notes: this.notes,
    traceId: this.meta?.traceId || null,
  };
};

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;

