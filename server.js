// backend/server.js

// 🧠 ابتدا تنظیم خروجی کنسول روی UTF-8
import process from "process";
try {
  process.stdout.setEncoding("utf8");
  process.stderr.setEncoding("utf8");
} catch (e) {
  console.warn("⚠️ UTF-8 encoding setup skipped:", e.message);
}

// 🌱 محیط و متعلقات اولیه
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/db.js";
import { initSocket } from "./services/socket.js";
import { startAnnouncementScheduler } from "./services/announcementService.js";
import { startReminderScheduler } from "./services/reminderService.js";
import { createBackup } from "./utils/backup.js";
import app from "./app.js";

dotenv.config();

// ⚙️ اتصال به پایگاه‌داده
connectDB();

// 🗃️ فقط یک‌بار برای تست یا زمان‌بندی
createBackup();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// 🔌 راه‌اندازی Socket.io
initSocket(server);

// ⏰ Schedulerها
startReminderScheduler();
startAnnouncementScheduler();

// 🚀 اجرای سرور
server.listen(PORT, () => {
  console.log(`🚀 سرور با موفقیت روی پورت ${PORT} اجرا شد`);
});

export default server;
