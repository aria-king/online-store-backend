//models/tagModel.js
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ù†Ø§Ù… Ø¨Ø±Ú†Ø³Ø¨ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"],
      trim: true,
      maxlength: 50,
      unique: true,
    },
    color: {
      type: String,
      default: "#2196F3", // Ø±Ù†Ú¯ Ù¾ÛŒØ´â€ŒÙØ±Ø¶ (Ø¢Ø¨ÛŒ)
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);
export default Tag;
