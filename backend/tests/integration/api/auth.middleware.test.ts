import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../src/app";
import { env } from "../../../src/infrastructure/config/environment";
import { rootRouter } from "../../../src/infrastructure/express/routes";
import { authMiddleware } from "../../../src/infrastructure/express/middlewares/auth.middleware";

// Mount a temporary route on the rootRouter for testing the middleware in isolation
rootRouter.get("/test-protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: (req as any).user
    }
  });
});

describe("API Integration: JWT Auth Middleware (RED Phase)", () => {
  const validPayload = {
    userId: "uuid-1234",
    email: "test@dealership.com",
    role: "SALES_REP"
  };

  // 1. Missing Token
  it("should return 401 Unauthorized if the Authorization header is missing", async () => {
    const res = await request(app).get("/api/v1/test-protected");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 2. Malformed Token
  it("should return 401 Unauthorized if the Authorization header is malformed", async () => {
    const res = await request(app).get("/api/v1/test-protected").set("Authorization", "Bearer");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 3. Expired Token
  it("should return 401 Unauthorized if the token has expired", async () => {
    const expiredToken = jwt.sign(validPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: "-1s" // Immediately expired
    });

    const res = await request(app).get("/api/v1/test-protected").set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 4. Invalid Signature
  it("should return 401 Unauthorized if the token signature is invalid", async () => {
    const fakeSecretToken = jwt.sign(validPayload, "completely_different_secret_key");

    const res = await request(app).get("/api/v1/test-protected").set("Authorization", `Bearer ${fakeSecretToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  // 5. Valid Token & Protected Route Access
  it("should pass the request through and populate req.user on valid token", async () => {
    const validToken = jwt.sign(validPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: "1h"
    });

    const res = await request(app).get("/api/v1/test-protected").set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.userId).toBe("uuid-1234");
    expect(res.body.data.user.role).toBe("SALES_REP");
  });
});
