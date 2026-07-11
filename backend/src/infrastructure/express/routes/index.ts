import { Router } from "express";
import { authRouter } from "./auth.routes";

const router = Router();

// Bind features router segments
router.use("/auth", authRouter);

export { router as rootRouter };
