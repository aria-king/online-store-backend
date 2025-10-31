import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // ðŸ“Œ Ù†Ø±Ø® Ù„Ø­Ø¸Ù‡â€ŒØ§ÛŒ Ø¯Ù„Ø§Ø±
    usdRate: {
      type: Number,
      default: 50000,
      min: [0, "Ù†Ø±Ø® Ø¯Ù„Ø§Ø± Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ù…Ù†ÙÛŒ Ø¨Ø§Ø´Ø¯"],
    },

    autoUpdatePrices: { type: Boolean, default: false },

    showPurchasePriceForStaff: { type: Boolean, default: false },
    showPurchasePriceForManager: { type: Boolean, default: true },

    priceUpdateMode: {
      type: String,
      enum: ["all", "usdOnly", "nonUsdOnly", "categories"],
      default: "all",
    },

    priceUpdateMethod: {
      type: String,
      enum: ["usd", "percent", "fixed"],
      default: "usd",
    },

    adjustmentValue: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          if (this.priceUpdateMethod === "percent") {
            return v >= -100 && v <= 100;
          }
          return true;
        },
        message: "Ø¯Ø±ØµØ¯ ØªØºÛŒÛŒØ± Ø¨Ø§ÛŒØ¯ Ø¨ÛŒÙ† -100 ØªØ§ +100 Ø¨Ø§Ø´Ø¯",
      },
    },

    selectedCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],

    // ðŸ“Œ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
    siteName: { type: String, default: "ÙØ±ÙˆØ´Ú¯Ø§Ù‡ Ù…Ù†" },

    enableWarrantyNotifications: { type: Boolean, default: true },

    notificationChannels: {
      type: [String],
      enum: ["sms", "email"],
      default: ["email"], // Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø§ÛŒÙ…ÛŒÙ„
    },

    warrantyMessageTemplate: {
      type: String,
      default:
        "Ù…Ø´ØªØ±ÛŒ Ú¯Ø±Ø§Ù…ÛŒ {customerName}ØŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ù…Ø­ØµÙˆÙ„ {productName} (Ù…Ø¯Ù„: {model}, Ø³Ø±ÛŒØ§Ù„/Ø¨Ø§Ø±Ú©Ø¯: {serialOrBarcode}) Ø§Ø² ØªØ§Ø±ÛŒØ® {validFrom} ØªØ§ {validTo} Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.",
    },

    // ðŸ“Œ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù¾ÛŒØ§Ù…Ú©
    usePatternSMS: { type: Boolean, default: false }, // ÙØ¹Ø§Ù„/ØºÛŒØ±ÙØ¹Ø§Ù„ Ø¨ÙˆØ¯Ù† Ù¾ÛŒØ§Ù…Ú© Ù‚Ø§Ù„Ø¨ÛŒ
    smsPatternName: { type: String, default: "warrantyTemplate" }, // Ù†Ø§Ù… Ø§Ù„Ú¯ÙˆÛŒ Ù¾ÛŒØ´â€ŒÙØ±Ø¶
  },
  { timestamps: true }
);

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);
export default Settings;
