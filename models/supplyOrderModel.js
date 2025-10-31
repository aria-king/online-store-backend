//models/supplyOrderModel.js
import mongoose from "mongoose";

const supplyOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        notes: { type: String, trim: true, maxlength: 500 },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "purchased", "cancelled"],
      default: "pending",
    },
    notes: { type: String, trim: true, maxlength: 1000 },
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

const SupplyOrder =
  mongoose.models.SupplyOrder ||
  mongoose.model("SupplyOrder", supplyOrderSchema);

export default SupplyOrder;

