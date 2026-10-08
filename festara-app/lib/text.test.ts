import { describe, expect, it } from "vitest";
import { initials } from "./text";

describe("initials", () => {
  it("uses the first letters of the first and last word", () => {
    expect(initials("Rashid Mehmood")).toBe("RM");
    expect(initials("Muhammad Sami Ullah")).toBe("MU");
  });
  it("handles one word and blanks", () => {
    expect(initials("Areeba")).toBe("A");
    expect(initials("  ")).toBe("?");
  });
});
