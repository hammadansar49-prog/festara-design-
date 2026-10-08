import { describe, expect, it } from "vitest";
import { sampleDashboard } from "./sample-dashboard";

const today = new Date(2026, 9, 8);

describe("sampleDashboard", () => {
  it("is deterministic per event", () => {
    expect(sampleDashboard("e-mehndi", 500000, 4, today)).toEqual(sampleDashboard("e-mehndi", 500000, 4, today));
    expect(sampleDashboard("e-naran", 150000, 2, today).confirmed).not.toBe(sampleDashboard("e-mehndi", 500000, 4, today).confirmed);
  });

  it("never decreases, ends on today and stays inside the budget", () => {
    const d = sampleDashboard("e-fest", 350000, 2, today);
    expect(d.points).toHaveLength(90);
    expect(d.points.at(-1)!.date).toBe("2026-10-08");
    for (let i = 1; i < d.points.length; i++) {
      expect(d.points[i].rsvps).toBeGreaterThanOrEqual(d.points[i - 1].rsvps);
      expect(d.points[i].spend).toBeGreaterThanOrEqual(d.points[i - 1].spend);
    }
    expect(d.spent).toBeLessThanOrEqual(350000);
    expect(d.confirmed).toBeLessThanOrEqual(d.invited);
  });
});
