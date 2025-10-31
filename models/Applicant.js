// models/Applicant.js
import mongoose from "mongoose";

// ðŸ“Œ ØªØ§Ø±ÛŒØ®Ú†Ù‡ ØªØºÛŒÛŒØ±Ø§Øª Applicant
const applicantHistorySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["stage_change", "status_change"], 
    required: true 
  },
  from: { type: String, default: null },
  to: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  notes: { type: String, default: "" },
  changedAt: { type: Date, default: Date.now },
});

const applicantSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    idDocUrl: { type: String },
    criminalRecordUrl: { type: String },

    stage: { type: String, default: "applied" },
    status: { type: String, enum: ["active", "withdrawn", "rejected", "hired"], default: "active" },

    // ðŸ“Œ ØªØ§Ø±ÛŒØ®Ú†Ù‡ ØªØºÛŒÛŒØ±Ø§Øª
    history: { type: [applicantHistorySchema], default: [] },

    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ðŸ“Œ Ù…ØªØ¯ Ú©Ù…Ú©ÛŒ Ø¨Ø±Ø§ÛŒ ØªØºÛŒÛŒØ± Ù…Ø±Ø­Ù„Ù‡
applicantSchema.methods.moveStage = async function (toStage, changedBy, notes = "") {
  this.history.push({
    type: "stage_change",
    from: this.stage,
    to: toStage,
    changedBy,
    notes,
    changedAt: new Date(),
  });
  this.stage = toStage;
  await this.save();
};

// ðŸ“Œ Ù…ØªØ¯ Ú©Ù…Ú©ÛŒ Ø¨Ø±Ø§ÛŒ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª
applicantSchema.methods.changeStatus = async function (toStatus, changedBy, notes = "") {
  this.history.push({
    type: "status_change",
    from: this.status,
    to: toStatus,
    changedBy,
    notes,
    changedAt: new Date(),
  });
  this.status = toStatus;
  await this.save();
};

const Applicant = mongoose.models.Applicant || mongoose.model("Applicant", applicantSchema);
export default Applicant;
