import Settings from "../models/Settings.js";

// ðŸ“Œ Ú¯Ø±ÙØªÙ† ØªÙ†Ø¸ÛŒÙ…Ø§Øª
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch (error) {
    console.error("âŒ getSettings error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

// ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª
export const updateSettings = async (req, res) => {
  try {
    const {
      usdRate,
      autoUpdatePrices,
      showPurchasePriceForStaff,
      showPurchasePriceForManager,
      priceUpdateMode,
      priceUpdateMethod,
      adjustmentValue,
      selectedCategories,
      // ðŸ“Œ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
      siteName,
      enableWarrantyNotifications,
      notificationChannels,
      warrantyMessageTemplate,
    } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Ø§Ú¯Ø± ØªÙ†Ø¸ÛŒÙ…Ø§Øª ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø´ØªØŒ Ø§ÙˆÙ„ÛŒÙ† Ø¨Ø§Ø± Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒØ´Ù‡
      settings = await Settings.create({
        usdRate,
        autoUpdatePrices,
        showPurchasePriceForStaff,
        showPurchasePriceForManager,
        priceUpdateMode,
        priceUpdateMethod,
        adjustmentValue,
        selectedCategories,
        siteName,
        enableWarrantyNotifications,
        notificationChannels,
        warrantyMessageTemplate,
      });
    } else {
      // ðŸ“Œ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ØªÚ© ØªÚ© ÙÛŒÙ„Ø¯Ù‡Ø§
      if (usdRate !== undefined) settings.usdRate = usdRate;
      if (autoUpdatePrices !== undefined) settings.autoUpdatePrices = autoUpdatePrices;
      if (showPurchasePriceForStaff !== undefined)
        settings.showPurchasePriceForStaff = showPurchasePriceForStaff;
      if (showPurchasePriceForManager !== undefined)
        settings.showPurchasePriceForManager = showPurchasePriceForManager;
      if (priceUpdateMode !== undefined) settings.priceUpdateMode = priceUpdateMode;
      if (priceUpdateMethod !== undefined) settings.priceUpdateMethod = priceUpdateMethod;
      if (adjustmentValue !== undefined) settings.adjustmentValue = adjustmentValue;
      if (selectedCategories !== undefined) settings.selectedCategories = selectedCategories;

      // ðŸ“Œ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ú¯Ø§Ø±Ø§Ù†ØªÛŒ
      if (siteName !== undefined) settings.siteName = siteName;
      if (enableWarrantyNotifications !== undefined)
        settings.enableWarrantyNotifications = enableWarrantyNotifications;
      if (notificationChannels !== undefined)
        settings.notificationChannels = notificationChannels;
      if (warrantyMessageTemplate !== undefined)
        settings.warrantyMessageTemplate = warrantyMessageTemplate;

      await settings.save();
    }

    res.json({ message: "ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯", settings });
  } catch (error) {
    console.error("âŒ updateSettings error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};
