import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

// Ù…Ø³ÛŒØ± ÙØ§ÛŒÙ„ Ù„Ø§Ú¯
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logPath = path.join(__dirname, "../logs/app.log");

// ØªÙ†Ø¸ÛŒÙ…Ø§Øª winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) =>
        `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: logPath }), // Ø°Ø®ÛŒØ±Ù‡ Ø¯Ø± ÙØ§ÛŒÙ„
    new winston.transports.Console(), // Ù†Ù…Ø§ÛŒØ´ Ø¯Ø± Ú©Ù†Ø³ÙˆÙ„
  ],
});

export default logger;
