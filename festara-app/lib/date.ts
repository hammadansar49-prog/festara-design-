const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** "2026-12-14" -> "Mon 14 Dec 2026" */
export function formatEventDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00`)).replace(",", "");
}

/** Whole calendar days from today to an ISO date. Negative when the date has passed. */
export function daysUntil(iso: string, today: Date = new Date()): number {
  const target = new Date(`${iso}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** Days until a timestamp, rounded up, never below zero. Used for invite expiry. */
export function daysLeft(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));
}
