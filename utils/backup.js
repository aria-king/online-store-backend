import { exec } from "child_process";
import path from "path";
import fs from "fs";
import util from "util";
import archiver from "archiver";
import unzipper from "unzipper";

const execAsync = util.promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), "backups");
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-shop";

// ðŸ“Œ Ú¯Ø±ÙØªÙ† Ø¨Ú©Ø§Ù¾
export async function createBackup(type = "manual") {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpDir = path.join(BACKUP_DIR, `dump-${type}-${timestamp}`);
    const zipFilePath = `${dumpDir}.zip`;

    // ðŸ“Œ Ø§Ø¬Ø±Ø§ÛŒ mongodump
    await execAsync(`mongodump --uri="${MONGO_URI}" --out="${dumpDir}"`);

    // ðŸ“Œ ÙØ´Ø±Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø¨Ø§ zip
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(dumpDir, false);
      archive.finalize();
    });

    // ðŸ“Œ Ù¾Ø§Ú© Ú©Ø±Ø¯Ù† Ù¾ÙˆØ´Ù‡ Ù…ÙˆÙ‚Øª dump
    fs.rmSync(dumpDir, { recursive: true, force: true });

    console.log(`âœ… Backup created: ${zipFilePath}`);
    return zipFilePath;
  } catch (err) {
    console.error("âŒ Error creating backup:", err);
    throw err;
  }
}

// ðŸ“Œ Ø±ÛŒØ³ØªÙˆØ± Ø¨Ú©Ø§Ù¾
export async function restoreBackup(zipFilePath) {
  try {
    if (!fs.existsSync(zipFilePath)) {
      throw new Error("Ø¨Ú©Ø§Ù¾ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
    }

    const extractDir = zipFilePath.replace(".zip", "");

    // ðŸ“Œ Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙØ§ÛŒÙ„ zip
    await fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // ðŸ“Œ Ø§Ø¬Ø±Ø§ÛŒ mongorestore
    await execAsync(`mongorestore --uri="${MONGO_URI}" --drop "${extractDir}"`);

    // ðŸ“Œ Ù¾Ø§Ú© Ú©Ø±Ø¯Ù† Ù¾ÙˆØ´Ù‡ Ø§Ø³ØªØ®Ø±Ø§Ø¬â€ŒØ´Ø¯Ù‡ Ø¨Ø¹Ø¯ Ø§Ø² Ø±ÛŒØ³ØªÙˆØ±
    fs.rmSync(extractDir, { recursive: true, force: true });

    console.log(`âœ… Backup restored from: ${zipFilePath}`);
  } catch (err) {
    console.error("âŒ Error restoring backup:", err);
    throw err;
  }
}
