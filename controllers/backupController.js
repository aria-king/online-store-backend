import path from "path";
import fs from "fs";
import { exec } from "child_process";
import dotenv from "dotenv";
import archiver from "archiver";
import unzipper from "unzipper";

dotenv.config();

const backupDir = path.join(process.cwd(), "backups");
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-shop";

// ðŸ“¦ Ú¯Ø±ÙØªÙ† Ø¨Ú©Ø§Ù¾
export const createBackup = (req, res) => {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dumpPath = path.join(backupDir, `dump-${timestamp}`);
  const zipPath = path.join(backupDir, `backup-${timestamp}.zip`);

  exec(`mongodump --uri="${mongoUri}" --out=${dumpPath}`, (err) => {
    if (err) return res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ú©Ø§Ù¾", error: err.message });

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(dumpPath, false);
    archive.finalize();

    output.on("close", () => {
      fs.rmSync(dumpPath, { recursive: true, force: true }); // Ø­Ø°Ù ÙØ§ÛŒÙ„ Ø®Ø§Ù…
      res.json({ message: "âœ… Ø¨Ú©Ø§Ù¾ Ú¯Ø±ÙØªÙ‡ Ø´Ø¯", file: `backup-${timestamp}.zip` });
    });
  });
};

// â™»ï¸ Ø±ÛŒØ³ØªÙˆØ± Ø§Ø² Ø¨Ú©Ø§Ù¾
export const restoreBackup = async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ message: "Ù†Ø§Ù… ÙØ§ÛŒÙ„ Ù„Ø§Ø²Ù… Ø§Ø³Øª" });

  const backupPath = path.join(backupDir, filename);
  if (!fs.existsSync(backupPath)) return res.status(404).json({ message: "ÙØ§ÛŒÙ„ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

  const extractPath = path.join(backupDir, "tmp_restore");
  if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath);

  try {
    await fs.createReadStream(backupPath).pipe(unzipper.Extract({ path: extractPath })).promise();

    exec(`mongorestore --uri="${mongoUri}" --drop ${extractPath}`, (err, stdout, stderr) => {
      fs.rmSync(extractPath, { recursive: true, force: true });
      if (err) return res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø±ÛŒØ³ØªÙˆØ±", error: err.message });

      res.json({ message: "âœ… Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø´Ø¯" });
    });
  } catch (err) {
    res.status(500).json({ message: "Ø®Ø·Ø§ Ø¯Ø± Ø±ÛŒØ³ØªÙˆØ±", error: err.message });
  }
};

// ðŸ“‚ Ù„ÛŒØ³Øª Ø¨Ú©Ø§Ù¾â€ŒÙ‡Ø§
export const listBackups = (req, res) => {
  if (!fs.existsSync(backupDir)) return res.json([]);

  const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".zip"));
  res.json(files);
};
