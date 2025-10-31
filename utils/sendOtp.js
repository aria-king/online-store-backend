import nodemailer from "nodemailer";
import axios from "axios";

// ================================
// ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ OTP Ø¨Ø§ Ø§ÛŒÙ…ÛŒÙ„
// ================================
export const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // Ø§Ú¯Ø± 465 Ø¨ÙˆØ¯ SSL ÙØ¹Ø§Ù„ Ù…ÛŒØ´Ù‡
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"ÙØ±ÙˆØ´Ú¯Ø§Ù‡ Ø¢Ù†Ù„Ø§ÛŒÙ†" <${process.env.SMTP_USER}>`,
      to,
      subject: "Ú©Ø¯ ØªØ£ÛŒÛŒØ¯ ÙˆØ±ÙˆØ¯",
      text: `Ú©Ø¯ ØªØ£ÛŒÛŒØ¯ Ø´Ù…Ø§: ${otp}`,
      html: `<p>Ú©Ø¯ ØªØ£ÛŒÛŒØ¯ Ø´Ù…Ø§:</p><h2>${otp}</h2>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`ðŸ“§ OTP Ø§ÛŒÙ…ÛŒÙ„ Ø´Ø¯ Ø¨Ù‡ ${to}`);
    return true;
  } catch (error) {
    console.error("âŒ Ø§Ø±Ø³Ø§Ù„ Ø§ÛŒÙ…ÛŒÙ„ OTP Ø®Ø·Ø§:", error.message);
    throw new Error("Ø§Ø±Ø³Ø§Ù„ Ø§ÛŒÙ…ÛŒÙ„ OTP Ø¨Ø§ Ø®Ø·Ø§ Ù…ÙˆØ§Ø¬Ù‡ Ø´Ø¯");
  }
};

// ================================
// ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ OTP Ø¨Ø§ SMS
// ================================
export const sendOtpSms = async (phone, otp) => {
  try {
    if (!process.env.SMS_API_KEY) {
      throw new Error("âš ï¸ SMS_API_KEY ØªØ¹Ø±ÛŒÙ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª");
    }

    // ðŸ“Œ Ù†Ù…ÙˆÙ†Ù‡ Ø¨Ø±Ø§ÛŒ Kavenegar
    const response = await axios.post(
      `https://api.kavenegar.com/v1/${process.env.SMS_API_KEY}/verify/lookup.json`,
      null, // Ø¨Ø¯Ù†Ù‡ Ù„Ø§Ø²Ù… Ù†ÛŒØ³ØªØŒ ÙÙ‚Ø· Ù¾Ø§Ø±Ø§Ù…ØªØ±Ù‡Ø§
      {
        params: {
          receptor: phone,
          token: otp,
          template: process.env.SMS_TEMPLATE || "otpTemplate",
        },
      }
    );

    console.log(`ðŸ“± OTP Ù¾ÛŒØ§Ù…Ú© Ø´Ø¯ Ø¨Ù‡ ${phone}`, response.data);
    return true;
  } catch (error) {
    console.error("âŒ Ø§Ø±Ø³Ø§Ù„ SMS OTP Ø®Ø·Ø§:", error.response?.data || error.message);
    throw new Error("Ø§Ø±Ø³Ø§Ù„ SMS OTP Ø¨Ø§ Ø®Ø·Ø§ Ù…ÙˆØ§Ø¬Ù‡ Ø´Ø¯");
  }
};
