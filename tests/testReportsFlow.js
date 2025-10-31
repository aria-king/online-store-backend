/**
 * @file testReportsFlow.js
 * ✅ تست خودکار سیستم گزارش‌ها (Reports)
 */

import request from "supertest";
import app from "../server.js"; // اگر سرور در مسیر دیگری است، تنظیم کن
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.development" });

// ============================
// 📦 تنظیمات اولیه تست
// ============================
const API_BASE = "/api/reports";
let authToken;

// قبل از همه: اتصال به MongoDB
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

// بعد از همه: قطع اتصال
afterAll(async () => {
  await mongoose.connection.close();
});

// ============================
// 🧩 توکن احراز هویت تستی (Mock)
// ============================
beforeAll(() => {
  // اگر سیستم لاگین داری، میشه از آن API گرفت.
  // فعلاً یک JWT ساده با نقش admin برای تست ایجاد می‌کنیم:
  const jwt = require("jsonwebtoken");
  authToken = jwt.sign(
    {
      id: new mongoose.Types.ObjectId().toString(),
      roles: ["admin"],
      isSuperAdmin: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
});

// ============================
// 🧪 تست‌ها
// ============================
describe("📊 Reports API Flow", () => {
  test("GET /users → باید آمار کاربران را برگرداند", async () => {
    const res = await request(app)
      .get(`${API_BASE}/users`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalUsers");
  });

  test("GET /orders → باید آمار سفارش‌ها را برگرداند", async () => {
    const res = await request(app)
      .get(`${API_BASE}/orders`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalOrders");
  });

  test("GET /messages → باید آمار پیام‌ها را برگرداند", async () => {
    const res = await request(app)
      .get(`${API_BASE}/messages`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalMessages");
  });

  test("GET /notifications → باید آمار اعلان‌ها را برگرداند", async () => {
    const res = await request(app)
      .get(`${API_BASE}/notifications`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalNotifications");
  });

  test("GET /overview → باید گزارش کلی را برگرداند", async () => {
    const res = await request(app)
      .get(`${API_BASE}/overview`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("orders");
    expect(res.body).toHaveProperty("notifications");
  });
});
