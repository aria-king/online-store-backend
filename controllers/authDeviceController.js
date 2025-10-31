// controllers/authDeviceController.js
import AdminAuthDevice from "../models/AdminAuthDevice.js";
import User from "../models/userModel.js";

/* ======================================
   📱 ثبت دستگاه جدید
====================================== */
export const registerDevice = async (req, res) => {
  try {
    const { deviceName, deviceType, publicKey, credentialId } = req.body;
    const userId = req.user._id;

    const device = await AdminAuthDevice.create({
      user: userId,
      deviceName,
      deviceType,
      publicKey,
      credentialId,
    });

    await User.findByIdAndUpdate(userId, { $push: { authDevices: device._id } });

    res.status(201).json({ success: true, message: "دستگاه با موفقیت ثبت شد", device });
  } catch (error) {
    console.error("❌ Device register error:", error);
    res.status(500).json({ success: false, message: "ثبت دستگاه با خطا مواجه شد" });
  }
};

/* ======================================
   🧩 تأیید کلید سخت‌افزاری (FIDO2 / WebAuthn)
====================================== */
export const verifyHardwareKey = async (req, res) => {
  try {
    const { credentialId } = req.body;
    const userId = req.user._id;

    const device = await AdminAuthDevice.findOne({ user: userId, credentialId, isActive: true });
    if (!device) {
      return res.status(401).json({ success: false, message: "دستگاه نامعتبر یا ثبت‌نشده است" });
    }

    device.lastUsedAt = new Date();
    await device.save();

    res.status(200).json({ success: true, message: "تأیید دستگاه موفقیت‌آمیز بود" });
  } catch (error) {
    console.error("❌ Device verify error:", error);
    res.status(500).json({ success: false, message: "تأیید دستگاه با خطا مواجه شد" });
  }
};

/* ======================================
   🗂️ دریافت لیست دستگاه‌های کاربر
====================================== */
export const getUserDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    const devices = await AdminAuthDevice.find({ user: userId });
    res.status(200).json({ success: true, devices });
  } catch (error) {
    console.error("❌ Get devices error:", error);
    res.status(500).json({ success: false, message: "دریافت دستگاه‌ها با خطا مواجه شد" });
  }
};

/* ======================================
   🧬 ثبت دستگاه بیومتریک (اثر انگشت، چهره و غیره)
====================================== */
export const registerBiometric = async (req, res) => {
  try {
    const { deviceName, biometricType, biometricToken } = req.body;
    const userId = req.user._id;

    const device = await AdminAuthDevice.create({
      user: userId,
      deviceName,
      deviceType: "biometric",
      biometricType,
      biometricToken,
    });

    res.status(201).json({ success: true, message: "دستگاه بیومتریک ثبت شد", device });
  } catch (error) {
    console.error("❌ Biometric register error:", error);
    res.status(500).json({ success: false, message: "ثبت دستگاه بیومتریک با خطا مواجه شد" });
  }
};

/* ======================================
   🧠 تأیید دستگاه بیومتریک
====================================== */
export const verifyBiometric = async (req, res) => {
  try {
    const { biometricToken } = req.body;
    const userId = req.user._id;

    const device = await AdminAuthDevice.findOne({
      user: userId,
      biometricToken,
      isActive: true,
    });

    if (!device) {
      return res.status(401).json({ success: false, message: "تأیید بیومتریک ناموفق بود" });
    }

    device.lastUsedAt = new Date();
    await device.save();

    res.status(200).json({ success: true, message: "بیومتریک با موفقیت تأیید شد" });
  } catch (error) {
    console.error("❌ Biometric verify error:", error);
    res.status(500).json({ success: false, message: "تأیید بیومتریک با خطا مواجه شد" });
  }
};

/* ======================================
   ⚙️ غیرفعال‌سازی دستگاه
====================================== */
export const deactivateDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id;

    const device = await AdminAuthDevice.findOne({ _id: deviceId, user: userId });
    if (!device) {
      return res.status(404).json({ success: false, message: "دستگاه یافت نشد" });
    }

    device.isActive = false;
    await device.save();

    res.status(200).json({ success: true, message: "دستگاه غیرفعال شد" });
  } catch (error) {
    console.error("❌ Deactivate device error:", error);
    res.status(500).json({ success: false, message: "غیرفعال‌سازی دستگاه با خطا مواجه شد" });
  }
};

/* ======================================
   🗑️ حذف کامل دستگاه از سیستم
====================================== */
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id;

    const device = await AdminAuthDevice.findOneAndDelete({ _id: deviceId, user: userId });
    if (!device) {
      return res.status(404).json({ success: false, message: "دستگاه یافت نشد یا قبلاً حذف شده است" });
    }

    res.status(200).json({ success: true, message: "دستگاه با موفقیت حذف شد" });
  } catch (error) {
    console.error("❌ Delete device error:", error);
    res.status(500).json({ success: false, message: "حذف دستگاه با خطا مواجه شد" });
  }
};
