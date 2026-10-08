import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email,
  password: z.string().min(8, "Use at least 8 characters."),
});
export type RegisterInput = z.output<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.output<typeof loginSchema>;

export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ password: z.string().min(8, "Use at least 8 characters.") });
