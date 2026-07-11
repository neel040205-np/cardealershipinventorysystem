import { z } from "zod";

// Shared validation primitives for vehicle fields
const makeSchema = z.string().min(1, "Make is required");
const modelSchema = z.string().min(1, "Model is required");
const categorySchema = z.string().min(1, "Category is required");
const priceSchema = z.number().positive("Price must be greater than zero");
const quantitySchema = z.number().int("Quantity must be an integer").nonnegative("Quantity must be non-negative");
const positiveQuantitySchema = z.number().int("Quantity must be an integer").positive("Quantity must be greater than zero");

// Zod schema for vehicle creation validation
export const createVehicleSchema = z.object({
  body: z
    .object({
      make: makeSchema,
      model: modelSchema,
      category: categorySchema,
      price: priceSchema,
      quantity: quantitySchema
    })
    .strict()
});

// Zod schema for vehicle update validation (allowing partial updates)
export const updateVehicleSchema = z.object({
  body: z
    .object({
      make: makeSchema.optional(),
      model: modelSchema.optional(),
      category: categorySchema.optional(),
      price: priceSchema.optional(),
      quantity: quantitySchema.optional()
    })
    .strict()
});

// Zod schema for vehicle restocking validation
export const restockVehicleSchema = z.object({
  body: z
    .object({
      quantity: positiveQuantitySchema
    })
    .strict()
});
