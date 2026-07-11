import { Router } from "express";
import { vehicleController } from "@infra/di/container";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { validateRequest } from "../middlewares/validation.middleware";
import { createVehicleSchema, updateVehicleSchema } from "../validation/vehicle.schemas";

const router = Router();

// GET /api/vehicles/search (Search vehicles with filters)
// Put this search route before /:id to prevent matching "search" as an ID parameter
router.get("/search", vehicleController.search);

// GET /api/vehicles (List vehicles with pagination)
router.get("/", vehicleController.list);

// POST /api/vehicles (Create new vehicle - Admin only)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateRequest(createVehicleSchema),
  vehicleController.create
);

// PUT /api/vehicles/:id (Update vehicle - Admin only)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateRequest(updateVehicleSchema),
  vehicleController.update
);

// DELETE /api/vehicles/:id (Delete vehicle - Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, vehicleController.delete);

// POST /api/vehicles/:id/purchase (Purchase vehicle - Authenticated users only)
router.post("/:id/purchase", authMiddleware, vehicleController.purchase);

export { router as vehicleRouter };
