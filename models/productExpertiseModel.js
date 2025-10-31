import mongoose from "mongoose";

const expertiseSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ú©Ø§Ø±Ø¨Ø±ÛŒ Ú©Ù‡ Ú©Ø§Ø±Ø´Ù†Ø§Ø³ Ø§Ø³Øª
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    files: [
      {
        url: { type: String }, // Ù„ÛŒÙ†Ú© ÙØ§ÛŒÙ„ (Ø¹Ú©Ø³/ÙˆÛŒØ¯ÛŒÙˆ)
        type: {
          type: String,
          enum: ["image", "video", "other"],
          default: "image",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // ØªØ§ÛŒÛŒØ¯ ÛŒØ§ Ø±Ø¯ Ù†Ø¸Ø± Ú©Ø§Ø±Ø´Ù†Ø§Ø³ ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ±
      default: "pending",
    },
  },
  { timestamps: true }
);

const ProductExpertise =
  mongoose.models.ProductExpertise ||
  mongoose.model("ProductExpertise", expertiseSchema);

export default ProductExpertise;
