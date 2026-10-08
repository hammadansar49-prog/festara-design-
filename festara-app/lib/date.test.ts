import { describe, expect, it } from "vitest";
import { daysLeft, daysUntil, formatEventDate } from "./date";

describe("formatEventDate", () => {
  it("writes weekday, day, month and year", () => {
    expect(formatEventDate("2026-12-14")).toBe("Mon 14 Dec 2026");
    expect(formatEventDate("2027-03-20")).toBe("Sat 20 Mar 2027");
  });
});

describe("daysUntil", () => {
  it("counts whole calendar days from today", () => {
    expect(daysUntil("2026-12-14", new Date(2026, 9, 8, 15, 30))).toBe(67);
    expect(daysUntil("2026-10-08", new Date(2026, 9, 8, 23, 59))).toBe(0);
    expect(daysUntil("2026-10-07", new Date(2026, 9, 8))).toBe(-1);
  });
});

describe("daysLeft", () => {
  it("rounds up and never goes below zero", () => {
    expect(daysLeft("2026-10-15T10:00:00Z", new Date("2026-10-08T10:00:00Z"))).toBe(7);
    expect(daysLeft("2026-10-15T10:00:00Z", new Date("2026-10-08T12:00:00Z"))).toBe(7);
    expect(daysLeft("2026-10-01T10:00:00Z", new Date("2026-10-08T10:00:00Z"))).toBe(0);
  });
});
