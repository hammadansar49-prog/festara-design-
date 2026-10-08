import { z } from "zod";
import { COVER_COLORS, EVENT_TYPES } from "@/lib/constants";

const budget = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? NaN : Number(v.replace(/,/g, ""))))
  .refine((n) => Number.isFinite(n), "Enter a budget as a number, like 500000.")
  .refine((n) => n >= 0, "Budget can't be negative. Enter an amount of 0 or more.");

export const eventSchema = z.object({
  name: z.string().trim().min(2, "Give the event a name.").max(80, "Keep the name under 80 characters."),
  type: z.enum(EVENT_TYPES, { message: "Choose an event type." }),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  location: z.string().trim().max(120, "Keep the location under 120 characters.").optional().transform((v) => v || null),
  description: z.string().trim().max(500, "Keep the description under 500 characters.").optional().transform((v) => v || null),
  totalBudget: budget,
  coverColor: z.enum(COVER_COLORS).default("mehndi"),
});
export type EventInput = z.output<typeof eventSchema>;

/** True when an ISO date (YYYY-MM-DD) is before today in local time. UC-01 extension 4b asks the user to confirm. */
export function isPastDate(iso: string, today: Date = new Date()): boolean {
  return iso < today.toLocaleDateString("en-CA");
}
