import { z } from "zod";

// Zod schema for vehicle creation validation
export const createVehicleSchema = z.object({
  body: z
    .object({
      make: z.string().min(1, "Make is required"),
      model: z.string().min(1, "Model is required"),
      category: z.string().min(1, "Category is required"),
      price: z.number().positive("Price must be greater than zero"),
      quantity: z.number().int().nonnegative("Quantity must be non-negative")
    })
    .strict()
});

// Zod schema for vehicle update validation (allowing partial updates)
export const updateVehicleSchema = z.object({
  body: z
    .object({
      make: z.string().min(1).optional(),
      model: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      price: z.number().positive().optional(),
      quantity: z.number().int().nonnegative().optional()
    })
    .strict()
});

// Zod schema for vehicle restocking validation
export const restockVehicleSchema = z.object({
  body: z
    .object({
      quantity: z.number().int("Quantity must be an integer").positive("Quantity must be greater than zero")
    })
    .strict()
});
