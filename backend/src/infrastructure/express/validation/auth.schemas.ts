import { z } from "zod";

// Zod Request Validation Schema for User Registration
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

// Zod Request Validation Schema for User Login
export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email address format"),
      password: z.string().min(1, "Password is required")
    })
    .strict()
});
export type LoginSchema = z.infer<typeof loginSchema>;
