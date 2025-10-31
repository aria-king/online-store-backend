//models/Job.js
import mongoose from "mongoose";
import slugify from "slugify";

const jobHistorySchema = new mongoose.Schema({
  type: { type: String, enum: ["create", "update", "delete", "status_change"], required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  from: { type: mongoose.Schema.Types.Mixed, default: null },
  to: { type: mongoose.Schema.Types.Mixed, required: true },
  notes: { type: String, default: "" },
  changedAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String },
    description: { type: String },
    location: { type: String },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },
    department: { type: String },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    isRemote: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ["active_visible", "inactive_visible", "hidden"],
      default: "active_visible",
    },
    stages: {
      type: [String],
      default: ["applied", "screening", "interview", "offer", "hired", "rejected"],
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now },
    expiryAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    history: { type: [jobHistorySchema], default: [] },
  },
  { timestamps: true }
);

// 🔹 تولید slug خودکار
jobSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// 🔹 ثبت تاریخچه
jobSchema.methods.addHistory = async function (type, changedBy, from, to, notes = "") {
  this.history.push({
    type,
    changedBy,
    from: JSON.parse(JSON.stringify(from)),
    to: JSON.parse(JSON.stringify(to)),
    notes,
    changedAt: new Date(),
  });
  await this.save();
};

// 🔹 ایندکس‌ها
jobSchema.index({ title: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ slug: 1 }, { unique: true, sparse: true });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
