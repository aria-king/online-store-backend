// models/taskModel.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ø¹Ù†ÙˆØ§Ù† ØªØ³Ú© Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "done", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    startDate: { type: Date },
    dueDate: { type: Date },

    // Ú©Ø§Ø±Ø¨Ø±ÛŒ Ú©Ù‡ ØªØ³Ú© Ø±Ùˆ Ø³Ø§Ø®ØªÙ‡
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ú†Ù†Ø¯ Ù†ÙØ± Ù…ÛŒâ€ŒØªÙˆÙ†Ù† Ù…Ø³Ø¦ÙˆÙ„ ÛŒÚ© ØªØ³Ú© Ø¨Ø§Ø´Ù†
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§ (Ø¨Ø¹Ø¯Ø§ ÙˆØµÙ„ Ù…ÛŒØ´Ù‡ Ø¨Ù‡ Ø³ÛŒØ³ØªÙ… ØªÚ¯â€ŒÙ‡Ø§)
    tags: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Tag",
         trim: true,
      },
    ],

    // ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ø¶Ù…ÛŒÙ…Ù‡ (Ø¨Ø¹Ø¯Ø§ ÙˆØµÙ„ Ù…ÛŒØ´Ù‡ Ø¨Ù‡ File Manager)
    attachments: [
  {
    fileName: String,
    fileUrl: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
],

  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
