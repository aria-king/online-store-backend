// models/logModel.js
import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "error",
    },
    message: { type: String, required: true },
    stack: { type: String },
    method: { type: String },
    url: { type: String },
    statusCode: { type: Number },
    ip: { type: String },
    userAgent: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);
export default Log;
