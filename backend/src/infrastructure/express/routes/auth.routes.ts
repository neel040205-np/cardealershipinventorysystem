import { Router } from "express";
import { authController } from "@infra/di/container";
import { registerSchema, loginSchema } from "@infra/express/validation/auth.schemas";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();

// POST /auth/register
// Route declaration is thin, declarative, and delegates logic directly to controller adapters
router.post("/register", validateRequest(registerSchema), authController.register);

// POST /auth/login
router.post("/login", validateRequest(loginSchema), authController.login);

export { router as authRouter };
