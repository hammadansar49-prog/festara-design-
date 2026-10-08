import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\+?[0-9 ()-]{7,16}$/.test(v), "Enter a valid phone number, like 0300 1234567."),
});
export type ProfileInput = z.output<typeof profileSchema>;
