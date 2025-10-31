//models/suggestionModel.js
import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["suggestion", "feedback", "complaint"], default: "suggestion" },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    response: {
      message: { type: String, trim: true, maxlength: 1000 },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: Date,
    },
    history: [
      {
        action: { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Suggestion || mongoose.model("Suggestion", suggestionSchema);
