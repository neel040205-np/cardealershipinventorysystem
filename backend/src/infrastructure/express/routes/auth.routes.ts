import { Router } from "express";
import { z } from "zod";
import { AuthController } from "@adapters/controllers/AuthController";
import { RegisterUser } from "@usecases/auth/RegisterUser";
import { PrismaUserRepository } from "@adapters/repositories/PrismaUserRepository";
import { BcryptHashService } from "@adapters/services/BcryptHashService";
import { validateRequest } from "../middlewares/validation.middleware";

const router = Router();

// Inject dependencies manually to maintain Clean Architecture decoupled boundaries
const userRepository = new PrismaUserRepository();
const hashService = new BcryptHashService();
const registerUseCase = new RegisterUser(userRepository, hashService);
const authController = new AuthController(registerUseCase);

// Zod schema matching payload conventions
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["ADMIN", "MANAGER", "SALES_REP"])
  })
});

// Configure endpoint with Zod validator middleware and controller adapter
router.post("/register", validateRequest(registerSchema), authController.register);

export { router as authRouter };
