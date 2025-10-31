import mongoose from "mongoose";

const backorderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["requested", "processing", "completed", "cancelled"], default: "requested" },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Backorder", backorderSchema);
