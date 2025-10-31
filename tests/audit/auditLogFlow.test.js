import request from "supertest";
import mongoose from "mongoose";
import app from "../../server.js";
import Role from "../../models/Role.js";
import AuditLog from "../../models/AuditLog.js";
import User from "../../models/userModel.js";

let token;
let createdRoleId;

/**
 * ðŸ§© Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ù‚Ø¨Ù„ Ø§Ø² ØªØ³Øªâ€ŒÙ‡Ø§
 */
beforeAll(async () => {
  // Ø§ÛŒØ¬Ø§Ø¯ Ú©Ø§Ø±Ø¨Ø± ØªØ³Øª Ø¨Ø±Ø§ÛŒ Ø¹Ù…Ù„ÛŒØ§Øª
  const userRes = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Admin",
      lastName: "Tester",
      email: "admin@test.com",
      password: "123456",
    });
  expect(userRes.statusCode).toBe(201);

  // ÙˆØ±ÙˆØ¯ Ø¨Ø±Ø§ÛŒ Ú¯Ø±ÙØªÙ† JWT
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "123456" });
  expect(loginRes.statusCode).toBe(200);
  token = loginRes.body.token;
});

/**
 * ðŸ§© Ù¾Ø§Ú©â€ŒØ³Ø§Ø²ÛŒ Ø¨Ø¹Ø¯ Ø§Ø² Ù‡Ù…Ù‡ ØªØ³Øªâ€ŒÙ‡Ø§
 */
afterAll(async () => {
  await mongoose.connection.close();
});

/**
 * âœ… Û±. Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´ Ø¬Ø¯ÛŒØ¯ + Ø«Ø¨Øª Ø¯Ø± AuditLog
 */
describe("ðŸ§© Role Creation & Audit Logging", () => {
  it("should create a new role and log the creation", async () => {
    const res = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "auditor",
        permissions: ["audit:view", "audit:delete"],
        description: "Role for audit management",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    createdRoleId = res.body.data._id;

    // Ø¨Ø±Ø±Ø³ÛŒ Ø«Ø¨Øª Ù„Ø§Ú¯ Ø§ÛŒØ¬Ø§Ø¯
    const log = await AuditLog.findOne({
      "entityType": "Role",
      "action": "create",
      "entityId": new mongoose.Types.ObjectId(createdRoleId),
    });

    expect(log).not.toBeNull();
    expect(log.meta).toHaveProperty("permissionsCount");
  });
});

/**
 * âœ… Û². Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù†Ù‚Ø´ + Ù„Ø§Ú¯ ØªØºÛŒÛŒØ±
 */
describe("ðŸ§© Role Update & Diff Logging", () => {
  it("should update the role and record an update log", async () => {
    const res = await request(app)
      .put(`/api/roles/${createdRoleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Updated description for auditor role",
        permissions: ["audit:view"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const log = await AuditLog.findOne({
      "entityType": "Role",
      "entityId": new mongoose.Types.ObjectId(createdRoleId),
      "action": "update",
    }).sort({ createdAt: -1 });

    expect(log).not.toBeNull();
    expect(log.meta.changedFields).toContain("description");
  });
});

/**
 * âœ… Û³. Ø­Ø°Ù Ù†Ù‚Ø´ + Ù„Ø§Ú¯ Ø­Ø°Ù
 */
describe("ðŸ§© Role Deletion & Audit", () => {
  it("should delete a role and record a delete log", async () => {
    const res = await request(app)
      .delete(`/api/roles/${createdRoleId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const log = await AuditLog.findOne({
      entityType: "Role",
      entityId: new mongoose.Types.ObjectId(createdRoleId),
      action: "delete",
    });
    expect(log).not.toBeNull();
    expect(log.meta).toHaveProperty("deletedAt");
  });

  it("should prevent deleting a system role", async () => {
    const sysRole = await Role.create({
      name: "superadmin",
      permissions: ["*"],
      isSystem: true,
    });

    const res = await request(app)
      .delete(`/api/roles/${sysRole._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Ø³ÛŒØ³ØªÙ…ÛŒ/);
  });
});
