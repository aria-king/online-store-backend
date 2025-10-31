import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5 }, // â­ Ø§Ù…ØªÛŒØ§Ø² Ø¨ÛŒÙ† 1 ØªØ§ 5
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Ú©Ø§Ø±Ø¨Ø±Ø§Ù†ÛŒ Ú©Ù‡ Ù„Ø§ÛŒÚ© Ú©Ø±Ø¯Ù†Ø¯
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Ú©Ø§Ø±Ø¨Ø±Ø§Ù†ÛŒ Ú©Ù‡ Ø¯ÛŒØ³Ù„Ø§ÛŒÚ© Ú©Ø±Ø¯Ù†Ø¯
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // ØªØ§ÛŒÛŒØ¯ ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ±
      default: "pending",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
