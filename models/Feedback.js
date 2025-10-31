import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    type: { type: String, enum: ["comment", "suggestion", "complaint"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["new", "reviewed", "resolved"], default: "new" },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
