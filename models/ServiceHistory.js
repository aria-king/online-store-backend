import mongoose from "mongoose";

const serviceHistorySchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    workType: {
      type: String,
      enum: ["installation", "repair"],
      required: true,
    },

    description: { type: String },
    usedParts: [{ type: String }],
    cost: { type: Number, default: 0 },

    attachments: [
      {
        fileType: { type: String, enum: ["image", "video", "document"], required: true },
        url: { type: String, required: true },
        downloadable: { type: Boolean, default: false }, // Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø¯Ø§Ù†Ù„ÙˆØ¯ ÙˆÛŒØ¯Ø¦Ùˆ
      filename: { type: String },
size: { type: Number }, // Ø¨Ø± Ø­Ø³Ø¨ KB

	},
    ],

    location: { type: String, default: null }, // Ø´Ù‡Ø± ÛŒØ§ Ø§Ø³ØªØ§Ù†
    doneAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ServiceHistory =
  mongoose.models.ServiceHistory ||
  mongoose.model("ServiceHistory", serviceHistorySchema);
serviceHistorySchema.index({ ticket: 1 });
serviceHistorySchema.index({ technician: 1 });

export default ServiceHistory;
