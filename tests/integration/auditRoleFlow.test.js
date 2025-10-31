import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js"; // Ø§Ù¾Ù„ÛŒÚ©ÛŒØ´Ù† Ø§ØµÙ„ÛŒ Express
import User from "../../models/userModel.js";
import Role from "../../models/Role.js";
import AuditLog from "../../models/AuditLog.js";
import Notification from "../../models/notificationModel.js";

let token = "";
let createdRoleId = "";

// Ù‚Ø¨Ù„ Ø§Ø² Ø´Ø±ÙˆØ¹ ØªØ³Øªâ€ŒÙ‡Ø§ â†’ Ø§ØªØµØ§Ù„ Ø¨Ù‡ Ø¯ÛŒØªØ§Ø¨ÛŒØ³
beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/test_audit";
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await Promise.all([
    User.deleteMany({}),
    Role.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);
});

// Ù¾Ø³ Ø§Ø² Ø§ØªÙ…Ø§Ù… Ù‡Ù…Ù‡ ØªØ³Øªâ€ŒÙ‡Ø§ â†’ Ø¨Ø³ØªÙ† Ø§ØªØµØ§Ù„
afterAll(async () => {
  await mongoose.connection.close();
});

describe("ðŸ” Auth â†’ Role â†’ Audit â†’ Notification flow", () => {
  test("1ï¸âƒ£ Register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ali",
        lastName: "Ahmadi",
        email: "ali@test.com",
        password: "123456",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  test("2ï¸âƒ£ Login with the registered user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ali@test.com",
        password: "123456",
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("3ï¸âƒ£ Create a new role", async () => {
    const res = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "manager",
        permissions: ["user:read", "user:update"],
        description: "Test manager role",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    createdRoleId = res.body.data._id;
  });

  test("4ï¸âƒ£ Update that role", async () => {
    const res = await request(app)
      .put(`/api/roles/${createdRoleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Updated description for test",
      })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  test("5ï¸âƒ£ Ensure audit log recorded the actions", async () => {
    const logs = await AuditLog.find({ entityType: "Role" }).lean();
    expect(logs.length).toBeGreaterThanOrEqual(2);

    const createLog = logs.find(l => l.action === "create");
    const updateLog = logs.find(l => l.action === "update");

    expect(createLog).toBeDefined();
    expect(updateLog).toBeDefined();
    expect(createLog.changedBy).toBeDefined();
  });

  test("6ï¸âƒ£ Fetch notifications for the user (if any)", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
