import request from "supertest";
import app from "../../server.js";

describe("ðŸ” Auth Flow Tests", () => {
  let token = null;

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ali",
        lastName: "Rezaei",
        email: "ali@test.com",
        password: "123456",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should login successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ali@test.com",
        password: "123456",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("should reject unauthorized request", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.statusCode).toBe(401);
  });

  it("should access protected route with token", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 204]).toContain(res.statusCode);
  });
});
