// services/smsService.js
import axios from "axios";

const API_KEY = process.env.KAVENEGAR_API_KEY;
const BASE_URL = `https://api.kavenegar.com/v1/${API_KEY}/sms/send.json`;
const PATTERN_URL = `https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json`;

/**
 * ðŸ“© Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© Ø³Ø§Ø¯Ù‡ (Ù…ØªÙ†ÛŒ)
 * @param {string} to Ø´Ù…Ø§Ø±Ù‡ Ú¯ÛŒØ±Ù†Ø¯Ù‡ (Ù…Ø«Ø§Ù„: 09120000000 ÛŒØ§ Ø¨Ø§ +98)
 * @param {string} message Ù…ØªÙ† Ù¾ÛŒØ§Ù…Ú©
 */
export const sendSMS = async (to, message) => {
  try {
    if (!API_KEY) throw new Error("âš ï¸ Kavenegar API Key ØªØ¹Ø±ÛŒÙ Ù†Ø´Ø¯Ù‡");

    const { data } = await axios.post(BASE_URL, null, {
      params: { receptor: to, message },
    });

    if (data.return.status === 200) {
      console.log(`ðŸ“± SMS Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯ Ø¨Ù‡ ${to}`);
      return { success: true, data };
    } else {
      console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ SMS:", data.return.message);
      return { success: false, error: data.return.message };
    }
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Kavenegar:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * ðŸ“Œ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© Ø¨Ø§ Pattern (Ø§Ù„Ú¯ÙˆÛŒ Ø¢Ù…Ø§Ø¯Ù‡)
 * @param {string} to Ø´Ù…Ø§Ø±Ù‡ Ú¯ÛŒØ±Ù†Ø¯Ù‡
 * @param {string} pattern Ù†Ø§Ù… Ø§Ù„Ú¯Ùˆ Ø¯Ø± Ù¾Ù†Ù„ Ú©Ø§ÙˆÙ‡â€ŒÙ†Ú¯Ø§Ø±
 * @param {object} tokens Ù…ØªØºÛŒØ±Ù‡Ø§ÛŒ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† (token, token2, token3, ...)
 */
export const sendPatternSMS = async (to, pattern, tokens = {}) => {
  try {
    if (!API_KEY) throw new Error("âš ï¸ Kavenegar API Key ØªØ¹Ø±ÛŒÙ Ù†Ø´Ø¯Ù‡");

    const params = {
      receptor: to,
      template: pattern,
      token: tokens.token || "",
      token2: tokens.token2 || "",
      token3: tokens.token3 || "",
    };

    const { data } = await axios.post(PATTERN_URL, null, { params });

    if (data.return.status === 200) {
      console.log(`ðŸ“± Pattern SMS (${pattern}) Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯ Ø¨Ù‡ ${to}`);
      return { success: true, data };
    } else {
      console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Pattern SMS:", data.return.message);
      return { success: false, error: data.return.message };
    }
  } catch (err) {
    console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Kavenegar:", err.message);
    return { success: false, error: err.message };
  }
};
