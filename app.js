// backend/app.js
process.stdout.write("\uFEFF"); // BOM برای UTF-8

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Middlewares
import { requestContext } from "./middleware/requestContext.js";
import { clientInfoMiddleware } from "./middleware/clientInfoMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes (همگی به صورت ES Module باید export default داشته باشند)
import productsRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import statsRoutes from "./routes/statsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatUploadRoutes from "./routes/chatUploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import recruitmentRoutes from "./routes/recruitmentRoutes.js";
import applicantRoutes from "./routes/applicantRoutes.js";
import serviceHistoryRoutes from "./routes/serviceHistoryRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import announcementReadRoutes from "./routes/announcementReadRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";
import supplyOrderRoutes from "./routes/supplyOrderRoutes.js";
import authDeviceRoutes from "./routes/authDeviceRoutes.js"; // ✅ حالا ESM است!

const app = express();

// 📁 مسیر فایل‌ها
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌐 تنظیمات پایه
app.use(cors());
app.use(express.json());
app.use(requestContext);
app.use(clientInfoMiddleware);

// 📂 مسیر فایل‌های استاتیک
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🧭 مسیرهای API
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat", chatUploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/jobs", recruitmentRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/service-history", serviceHistoryRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/announcement-reads", announcementReadRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/auth-device", authDeviceRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/supply-orders", supplyOrderRoutes);

// ⚠️ هندلرهای خطا (در انتها)
app.use(notFound);
app.use(errorHandler);

export default app;
