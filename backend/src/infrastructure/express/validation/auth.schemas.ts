import { z } from "zod";

// Zod Request Validation Schema for User Registration
// Enforces name, email, password parameters and rejects extra payload fields using .strict()
export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address format"),
      password: z.string().min(8, "Password must be at least 8 characters long")
    })
    .strict()
});
export type RegisterSchema = z.infer<typeof registerSchema>;
