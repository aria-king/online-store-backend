//controllers/warrantyController.js
import Warranty from "../models/Warranty.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import User from "../models/userModel.js";   // âœ…
import { createNotification } from "../services/notificationService.js";
import { sendSMS, sendPatternSMS } from "../services/smsService.js"; // âœ…
import { sendEmail } from "../services/emailService.js";


// ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø¬Ø¯ÛŒØ¯
export const createWarranty = async (req, res) => {
  try {
    const { product, user, serialNumber } = req.body;

    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ message: "Ù…Ø­ØµÙˆÙ„ ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    }

    const userData = await User.findById(user);
    if (!userData) {
      return res.status(404).json({ message: "Ú©Ø§Ø±Ø¨Ø± ÛŒØ§ÙØª Ù†Ø´Ø¯" });
    }

const existing = await Warranty.findOne({ serialNumber });
if (existing) return res.status(400).json({ message: "Ø³Ø±ÛŒØ§Ù„ ØªÚ©Ø±Ø§Ø±ÛŒ Ø§Ø³Øª" });

    // Ù…Ø­Ø§Ø³Ø¨Ù‡ ØªØ§Ø±ÛŒØ® Ø´Ø±ÙˆØ¹ Ùˆ Ù¾Ø§ÛŒØ§Ù† Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setMonth(validTo.getMonth() + (productData.warrantyPeriod || 0));

    const warranty = await Warranty.create({
      product,
      user,
      serialNumber,
      validFrom,
      validTo,
      status: "valid",
    });

    // ðŸ“Œ Ø¨Ø±Ø±Ø³ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…
    const settings = await Settings.findOne({});
    if (settings?.enableWarrantyNotifications) {
      let message = settings.warrantyMessageTemplate || 
        "Ø¢Ù‚Ø§ÛŒ/Ø®Ø§Ù†Ù… {customerName}ØŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ù…Ø­ØµÙˆÙ„ {productName} Ø´Ù…Ø§ Ø¨Ø§ Ø´Ù…Ø§Ø±Ù‡ Ø³Ø±ÛŒØ§Ù„ {serialOrBarcode} Ø§Ø² ØªØ§Ø±ÛŒØ® {validFrom} ØªØ§ {validTo} Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.";

      message = message
        .replace("{customerName}", `${userData.name} ${userData.lastName || ""}`)
        .replace("{productName}", productData.name)
        .replace("{model}", productData.model || "-")
        .replace("{serialOrBarcode}", serialNumber || productData.barcode || "-")
        .replace("{validFrom}", validFrom.toLocaleDateString("fa-IR"))
        .replace("{validTo}", validTo.toLocaleDateString("fa-IR"));

      console.log("ðŸ“© Ù¾ÛŒØ§Ù… Ú¯Ø§Ø±Ø§Ù†ØªÛŒ Ø¨Ø±Ø§ÛŒ Ù…Ø´ØªØ±ÛŒ:", message);

      // ðŸ“Œ Ø§ÛŒØ¬Ø§Ø¯ Ù†ÙˆØªÛŒÙÛŒÚ©ÛŒØ´Ù† Ø¯Ø± Ø³ÛŒØ³ØªÙ…
      await createNotification(userData._id, "warranty", message, {
        product: productData._id,
        warranty: warranty._id,
      });

      // ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© / Ø§ÛŒÙ…ÛŒÙ„ ÙˆØ§Ù‚Ø¹ÛŒ
     // ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© / Ø§ÛŒÙ…ÛŒÙ„ ÙˆØ§Ù‚Ø¹ÛŒ
if (settings.notificationChannels.includes("sms") && userData.phone) {
  if (settings.usePatternSMS) {
    // âœ… Ø§Ø±Ø³Ø§Ù„ Ø¨Ø§ Ø§Ù„Ú¯ÙˆÛŒ Ú©Ø§ÙˆÙ‡â€ŒÙ†Ú¯Ø§Ø±
    await sendPatternSMS(userData.phone, settings.smsPatternName, {
      token: `${userData.name} ${userData.lastName || ""}`, // Ù†Ø§Ù… Ù…Ø´ØªØ±ÛŒ
      token2: productData.name, // Ù†Ø§Ù… Ù…Ø­ØµÙˆÙ„
      token3: serialNumber || productData.barcode || "-", // Ø³Ø±ÛŒØ§Ù„/Ø¨Ø§Ø±Ú©Ø¯
      token4: validTo.toLocaleDateString("fa-IR"), // ØªØ§Ø±ÛŒØ® Ù¾Ø§ÛŒØ§Ù†
    });
  } else {
    // âœ… Ø§Ø±Ø³Ø§Ù„ Ù…ØªÙ† Ø¢Ø²Ø§Ø¯
    await sendSMS(userData.phone, message);
  }
}

if (settings.notificationChannels.includes("email") && userData.email) {
  await sendEmail(userData.email, "Ø§Ø·Ù„Ø§Ø¹ Ø±Ø³Ø§Ù†ÛŒ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ", message);
}

    }

    res.status(201).json(warranty);
  } catch (err) {
    console.error("âŒ createWarranty error:", err);
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ú¯Ø§Ø±Ø§Ù†ØªÛŒ" });
  }
};
