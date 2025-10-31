import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

// Ù…Ø³ÛŒØ± Ø°Ø®ÛŒØ±Ù‡ Ø¨Ú©Ø§Ù¾â€ŒÙ‡Ø§
const backupBasePath = path.join(process.cwd(), "backups");

// Ù…Ø·Ù…Ø¦Ù† Ù…ÛŒâ€ŒØ´ÛŒÙ… Ù¾ÙˆØ´Ù‡ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø±Ù‡
if (!fs.existsSync(backupBasePath)) {
  fs.mkdirSync(backupBasePath, { recursive: true });
}

// ØªØ§Ø¨Ø¹ Ø¨Ú©Ø§Ù¾â€ŒÚ¯ÛŒØ±ÛŒ
const createBackup = (type = "daily") => {
  const now = new Date();
  const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const folder = path.join(backupBasePath, type, timestamp);

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const command = `mongodump --uri="${process.env.MONGO_URI}" --out="${folder}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`âŒ Ø®Ø·Ø§ Ø¯Ø± Ø¨Ú©Ø§Ù¾ (${type}):`, error.message);
      return;
    }
    console.log(`âœ… Ø¨Ú©Ø§Ù¾ ${type} Ø¯Ø± ${folder} Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯`);
  });
};

// â° Ø²Ù…Ø§Ù†â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§
// Ù‡Ø± Ø´Ø¨ Ø³Ø§Ø¹Øª 00:00
cron.schedule("0 0 * * *", () => {
  createBackup("daily");
});

// Ø¢Ø®Ø± Ù‡Ø± Ù…Ø§Ù‡ (Ø±ÙˆØ² 1 Ù…Ø§Ù‡ Ø¨Ø¹Ø¯ÛŒØŒ Ø³Ø§Ø¹Øª 00:00)
cron.schedule("0 0 1 * *", () => {
  createBackup("monthly");
});

// Ø§ÙˆÙ„ Ú˜Ø§Ù†ÙˆÛŒÙ‡ Ù‡Ø± Ø³Ø§Ù„ØŒ Ø³Ø§Ø¹Øª 00:00
cron.schedule("0 0 1 1 *", () => {
  createBackup("yearly");
});

export default createBackup;
