import { describe, expect, it } from "vitest";
import { parseForm, formDataToObject } from "./common";
import { loginSchema, registerSchema, resetSchema } from "./auth";
import { profileSchema } from "./profile";
import { eventSchema, isPastDate } from "./event";
import { invitationSchema } from "./invite";

const goodEvent = {
  name: "Ayesha's Mehndi",
  type: "mehndi",
  eventDate: "2026-12-14",
  location: "Lahore",
  description: "",
  totalBudget: "500,000",
  coverColor: "mehndi",
};

describe("registerSchema", () => {
  it("accepts valid details and normalises the email", () => {
    const r = parseForm(registerSchema, { fullName: " Rashid Mehmood ", email: "Rashid@Example.com", password: "festara123" });
    expect(r).toEqual({ ok: true, data: { fullName: "Rashid Mehmood", email: "rashid@example.com", password: "festara123" } });
  });
  it("rejects a short password and a bad email", () => {
    const r = parseForm(registerSchema, { fullName: "Rashid", email: "nope", password: "short" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.fieldErrors.email).toBe("Enter a valid email address.");
      expect(r.fieldErrors.password).toBe("Use at least 8 characters.");
    }
  });
});

describe("loginSchema and resetSchema", () => {
  it("requires a password on login", () => {
    const r = parseForm(loginSchema, { email: "a@b.co", password: "" });
    expect(r.ok).toBe(false);
  });
  it("requires 8 characters on reset", () => {
    expect(parseForm(resetSchema, { password: "1234567" }).ok).toBe(false);
    expect(parseForm(resetSchema, { password: "12345678" }).ok).toBe(true);
  });
});

describe("profileSchema", () => {
  it("turns an empty phone into null", () => {
    const r = parseForm(profileSchema, { fullName: "Rashid Mehmood", phone: "" });
    expect(r).toEqual({ ok: true, data: { fullName: "Rashid Mehmood", phone: null } });
  });
  it("accepts a Pakistani mobile number", () => {
    expect(parseForm(profileSchema, { fullName: "Rashid", phone: "0300 1234567" }).ok).toBe(true);
  });
  it("rejects letters in the phone", () => {
    const r = parseForm(profileSchema, { fullName: "Rashid", phone: "call me" });
    expect(r.ok).toBe(false);
  });
});

describe("eventSchema", () => {
  it("parses a formatted budget string to a number and nulls empty optionals", () => {
    const r = parseForm(eventSchema, goodEvent);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.totalBudget).toBe(500000);
      expect(r.data.description).toBeNull();
    }
  });
  it("rejects a negative budget with the report message (TC-05)", () => {
    const r = parseForm(eventSchema, { ...goodEvent, totalBudget: "-100" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.totalBudget).toBe("Budget can't be negative. Enter an amount of 0 or more.");
  });
  it("rejects an empty budget and a non-number", () => {
    expect(parseForm(eventSchema, { ...goodEvent, totalBudget: "" }).ok).toBe(false);
    expect(parseForm(eventSchema, { ...goodEvent, totalBudget: "lots" }).ok).toBe(false);
  });
  it("rejects an unknown type and a missing name", () => {
    expect(parseForm(eventSchema, { ...goodEvent, type: "party" }).ok).toBe(false);
    expect(parseForm(eventSchema, { ...goodEvent, name: " " }).ok).toBe(false);
  });
  it("defaults the cover color", () => {
    const { coverColor: _omit, ...rest } = goodEvent;
    const r = parseForm(eventSchema, rest);
    expect(r.ok && r.data.coverColor).toBe("mehndi");
  });
});

describe("isPastDate", () => {
  const today = new Date(2026, 9, 8); // 8 Oct 2026, local
  it("flags yesterday but not today", () => {
    expect(isPastDate("2026-10-07", today)).toBe(true);
    expect(isPastDate("2026-10-08", today)).toBe(false);
    expect(isPastDate("2026-12-14", today)).toBe(false);
  });
});

describe("invitationSchema and formDataToObject", () => {
  it("allows only member or guest", () => {
    expect(parseForm(invitationSchema, { role: "member" }).ok).toBe(true);
    expect(parseForm(invitationSchema, { role: "guest" }).ok).toBe(true);
    expect(parseForm(invitationSchema, { role: "admin" }).ok).toBe(false);
  });
  it("turns FormData into a plain object of strings", () => {
    const fd = new FormData();
    fd.set("role", "guest");
    expect(formDataToObject(fd)).toEqual({ role: "guest" });
  });
});
