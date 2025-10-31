//models/Warranty.js
import mongoose from "mongoose";

const warrantyUsageSchema = new mongoose.Schema(
  {
    issueDescription: { type: String, required: true },
    decision: {
      type: String,
      enum: ["repaired", "replaced", "rejected"],
      required: true,
    },
    hasWarrantyCondition: { type: Boolean, default: true },
    costType: {
      type: String,
      enum: ["free", "partial", "full"],
      default: "free",
    },
    costAmount: { type: Number, default: 0 },
    notes: { type: String },
    usedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const warrantySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serialNumber: { type: String, required: true, unique: true },

    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },

    status: {
      type: String,
      enum: ["valid", "expired", "rejected"],
      default: "valid",
    },

    usageHistory: [warrantyUsageSchema],
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ðŸ“Œ Ø«Ø¨Øª Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø¬Ø¯ÛŒØ¯
warrantySchema.methods.addUsage = async function (usageData) {
  this.usageHistory.push(usageData);
  this.usageCount = this.usageHistory.length;
  await this.save();
  return this;
};

warrantySchema.index({ product: 1, user: 1 });

warrantySchema.methods.isValid = function() {
  const now = new Date();
  return this.status === 'valid' && now >= this.validFrom && now <= this.validTo;
};

warrantySchema.pre('save', function(next) {
  if (this.validTo <= this.validFrom) {
    return next(new Error('validTo must be after validFrom'));
  }
  next();
});


const Warranty =
  mongoose.models.Warranty || mongoose.model("Warranty", warrantySchema);
export default Warranty;
