import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("puts Rs first and groups thousands", () => {
    expect(formatMoney(412000)).toBe("Rs 412,000");
  });
  it("writes zero", () => {
    expect(formatMoney(0)).toBe("Rs 0");
  });
  it("groups millions", () => {
    expect(formatMoney(1250000)).toBe("Rs 1,250,000");
  });
  it("rounds away paisa", () => {
    expect(formatMoney(88000.6)).toBe("Rs 88,001");
  });
  it("puts the minus sign before Rs", () => {
    expect(formatMoney(-5000)).toBe("-Rs 5,000");
  });
});
