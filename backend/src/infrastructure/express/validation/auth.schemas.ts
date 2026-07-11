import { z } from "zod";

// Zod Request Validation Schema for User Registration
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["ADMIN", "MANAGER", "SALES_REP"])
  })
});
export type RegisterSchema = z.infer<typeof registerSchema>;
