import { exec } from "child_process";
import path from "path";
import fs from "fs";
import unzipper from "unzipper";
import dotenv from "dotenv";

dotenv.config();

const backupDir = path.join(process.cwd(), "backups");
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-shop";

async function restoreBackup(backupFile) {
  try {
    // Ù…Ø³ÛŒØ± ÙØ§ÛŒÙ„ Ø¨Ú©Ø§Ù¾
    const backupPath = path.join(backupDir, backupFile);

    if (!fs.existsSync(backupPath)) {
      console.error("âŒ ÙØ§ÛŒÙ„ Ø¨Ú©Ø§Ù¾ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯:", backupPath);
      return;
    }

    // Ù…Ø³ÛŒØ± Ù…ÙˆÙ‚Øª Ø¨Ø±Ø§ÛŒ Ø§Ú©Ø³ØªØ±Ú©Øª
    const extractPath = path.join(backupDir, "tmp_restore");
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
    }

    console.log("ðŸ“‚ Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙØ§ÛŒÙ„ Ø¨Ú©Ø§Ù¾...");
    await fs
      .createReadStream(backupPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    console.log("â™»ï¸ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø¯ÛŒØªØ§...");
    exec(
      `mongorestore --uri="${mongoUri}" --drop ${extractPath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("âŒ Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ:", error.message);
          return;
        }
        if (stderr) console.error("âš ï¸ Ù‡Ø´Ø¯Ø§Ø±:", stderr);
        console.log("âœ… Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø´Ø¯");
      }
    );
  } catch (error) {
    console.error("âŒ Ø®Ø·Ø§:", error);
  }
}

// Ù…Ø«Ø§Ù„: Ø¢Ø®Ø±ÛŒÙ† Ø¨Ú©Ø§Ù¾ Ø±Ùˆ Ø¨Ø±Ú¯Ø±Ø¯ÙˆÙ†
const backups = fs.readdirSync(backupDir).filter(f => f.endsWith(".zip"));
if (backups.length === 0) {
  console.log("âŒ Ù‡ÛŒÚ† Ø¨Ú©Ø§Ù¾ÛŒ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯.");
} else {
  const latest = backups.sort().reverse()[0];
  console.log("ðŸ“¦ Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø§Ø²:", latest);
  restoreBackup(latest);
}
