// services/emailService.js
// ðŸ“Œ Ø³Ø±ÙˆÛŒØ³ ØªØ³ØªÛŒ Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø³Ø§Ù„ Email
import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    // ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø§ÙˆÙ„ÛŒÙ‡ (Ù†Ø³Ø®Ù‡ ØªØ³ØªÛŒ)
    const transporter = nodemailer.createTransport({
      service: "gmail", // Ù…ÛŒâ€ŒØªÙˆÙ†ÛŒ Ø¨Ø¹Ø¯Ø§ ØªØºÛŒÛŒØ± Ø¨Ø¯ÛŒ
      auth: {
        user: process.env.SMTP_USER || "your_email@gmail.com",
        pass: process.env.SMTP_PASS || "your_password",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER || "your_email@gmail.com",
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("ðŸ“§ Ø§ÛŒÙ…ÛŒÙ„ Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ø§ÛŒÙ…ÛŒÙ„:", err);
    return { success: false, error: err.message };
  }
};
