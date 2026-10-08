import { beforeEach, describe, expect, it } from "vitest";
import { createStore, MockDataSource, type SessionStore, type Store } from "./mock";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS } from "@/lib/messages";
import type { EventInput } from "@/lib/validation/event";

const DAY = 86_400_000;
let clock = new Date("2026-10-08T10:00:00Z");

function memorySession(): SessionStore {
  let uid: string | undefined;
  return { get: async () => uid, set: async (id) => void (uid = id), clear: async () => void (uid = undefined) };
}

let store: Store;
let n = 0;
async function actor(email: string, fullName = email.split("@")[0]): Promise<MockDataSource> {
  const ds = new MockDataSource(store, { session: memorySession(), now: () => clock, newId: () => `id-${++n}` });
  const existing = store.users.find((u) => u.email === email);
  if (existing) await ds.signIn({ email, password: "festara123" });
  else await ds.signUp({ fullName, email, password: "festara123" });
  return ds;
}

const input: EventInput = {
  name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
  description: null, totalBudget: 500000, coverColor: "mehndi",
};

beforeEach(() => { store = createStore(); n = 0; clock = new Date("2026-10-08T10:00:00Z"); });

describe("auth", () => {
  it("registers, then signs in; wrong password gives the exact message (TC-02)", async () => {
    await actor("rashid@example.com", "Rashid Mehmood");
    const other = new MockDataSource(store, { session: memorySession() });
    const bad = await other.signIn({ email: "rashid@example.com", password: "wrong" });
    expect(bad).toEqual({ ok: false, code: "auth", message: "Invalid login credentials" });
    const good = await other.signIn({ email: "rashid@example.com", password: "festara123" });
    expect(good.ok && good.data.fullName).toBe("Rashid Mehmood");
  });
  it("rejects a duplicate email", async () => {
    await actor("rashid@example.com");
    const again = new MockDataSource(store, { session: memorySession() });
    const r = await again.signUp({ fullName: "Other", email: "rashid@example.com", password: "festara123" });
    expect(r.ok).toBe(false);
  });
  it("updates the profile (FR-04)", async () => {
    const a = await actor("rashid@example.com", "Rashid Mehmood");
    const r = await a.updateProfile({ fullName: "Rashid M.", phone: "0300 1234567" });
    expect(r.ok && r.data.phone).toBe("0300 1234567");
    expect((await a.getCurrentUser())?.fullName).toBe("Rashid M.");
  });
});

describe("events", () => {
  it("makes the creator Admin (FR-06, TC-04)", async () => {
    const a = await actor("rashid@example.com");
    const created = await a.createEvent(input);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const detail = await a.getEvent(created.data.id);
    expect(detail.ok && detail.data.role).toBe("admin");
  });
  it("lists only my events with my role (FR-09, TC-13)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    await a.createEvent(input);
    await b.createEvent({ ...input, name: "Naran Trip", type: "trip", coverColor: "sky" });
    const mine = await a.listMyEvents();
    expect(mine.map((e) => e.name)).toEqual(["Ayesha's Mehndi"]);
    expect(mine[0].role).toBe("admin");
    expect(mine[0].memberCount).toBe(1);
  });
  it("hides an event from a non-member (TC-10)", async () => {
    const a = await actor("rashid@example.com");
    const d = await actor("outsider@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    expect(await d.getEvent(created.data.id)).toEqual({ ok: false, code: "not_found", message: NO_ACCESS });
    expect(await d.listMyEvents()).toEqual([]);
  });
  it("lets only the Admin edit (FR-07, TC-06)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const inv = await a.createInvitation(created.data.id, "member");
    if (!inv.ok) throw new Error("setup");
    await b.acceptInvitation(inv.data.token);
    const denied = await b.updateEvent(created.data.id, { ...input, name: "Hacked" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("forbidden");
    const allowed = await a.updateEvent(created.data.id, { ...input, name: "Ayesha's Mehndi Night" });
    expect(allowed.ok && allowed.data.name).toBe("Ayesha's Mehndi Night");
  });
  it("deletes only with the exact name, and removes it for everyone (FR-08, TC-11)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const inv = await a.createInvitation(created.data.id, "member");
    if (!inv.ok) throw new Error("setup");
    await b.acceptInvitation(inv.data.token);
    expect((await a.deleteEvent(created.data.id, "wrong name")).ok).toBe(false);
    const memberTry = await b.deleteEvent(created.data.id, "Ayesha's Mehndi");
    expect(memberTry.ok).toBe(false);
    expect((await a.deleteEvent(created.data.id, "Ayesha's Mehndi")).ok).toBe(true);
    expect(await a.listMyEvents()).toEqual([]);
    expect(await b.listMyEvents()).toEqual([]);
    expect(store.invitations).toEqual([]);
  });
});

describe("invitations", () => {
  async function setup() {
    const a = await actor("rashid@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    return { a, eventId: created.data.id };
  }
  it("lets only the Admin create links; token is 22 URL-safe chars valid 7 days (FR-10)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    expect(inv.ok).toBe(true);
    if (!inv.ok) return;
    expect(inv.data.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(new Date(inv.data.expiresAt).getTime() - clock.getTime()).toBe(7 * DAY);
    await b.acceptInvitation(inv.data.token);
    const denied = await b.createInvitation(eventId, "guest");
    expect(denied.ok).toBe(false);
  });
  it("adds the user with the link's role and counts the use (FR-11, TC-07)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    if (!inv.ok) throw new Error("setup");
    const r = await b.acceptInvitation(inv.data.token);
    expect(r).toEqual({ ok: true, data: { eventId } });
    const detail = await b.getEvent(eventId);
    expect(detail.ok && detail.data.role).toBe("member");
    expect(store.invitations[0].usedCount).toBe(1);
  });
  it("keeps the existing role when an existing member opens a link (UC-02 4a)", async () => {
    const { a, eventId } = await setup();
    const inv = await a.createInvitation(eventId, "guest");
    if (!inv.ok) throw new Error("setup");
    await a.acceptInvitation(inv.data.token);
    const detail = await a.getEvent(eventId);
    expect(detail.ok && detail.data.role).toBe("admin");
    expect(store.invitations[0].usedCount).toBe(0);
  });
  it("rejects unknown and expired links with the exact message (FR-12, TC-08)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    if (!inv.ok) throw new Error("setup");
    expect(await b.acceptInvitation("nope")).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    clock = new Date(clock.getTime() + 8 * DAY);
    expect(await b.acceptInvitation(inv.data.token)).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    expect((await b.getInvitationPreview(inv.data.token)).ok).toBe(false);
    expect(await b.listMyEvents()).toEqual([]);
  });
  it("previews a valid link without joining", async () => {
    const { a, eventId } = await setup();
    const inv = await a.createInvitation(eventId, "guest");
    if (!inv.ok) throw new Error("setup");
    const anon = new MockDataSource(store, { session: memorySession(), now: () => clock });
    const p = await anon.getInvitationPreview(inv.data.token);
    expect(p.ok && p.data.eventName).toBe("Ayesha's Mehndi");
    expect(p.ok && p.data.inviterName).toBe("rashid");
    expect(p.ok && p.data.role).toBe("guest");
  });
});

describe("members and roles", () => {
  async function setup() {
    const a = await actor("rashid@example.com", "Rashid");
    const b = await actor("hamza@example.com", "Hamza");
    const g = await actor("tariq@example.com", "Tariq");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const eventId = created.data.id;
    const m = await a.createInvitation(eventId, "member");
    const gi = await a.createInvitation(eventId, "guest");
    if (!m.ok || !gi.ok) throw new Error("setup");
    await b.acceptInvitation(m.data.token);
    await g.acceptInvitation(gi.data.token);
    return { a, b, g, eventId, hamzaId: (await b.getCurrentUser())!.id, rashidId: (await a.getCurrentUser())!.id };
  }
  it("lists members for Admin and Member but not Guest", async () => {
    const { a, b, g, eventId } = await setup();
    const list = await a.listMembers(eventId);
    expect(list.ok && list.data.map((x) => x.role)).toEqual(["admin", "member", "guest"]);
    expect((await b.listMembers(eventId)).ok).toBe(true);
    const denied = await g.listMembers(eventId);
    expect(denied.ok).toBe(false);
  });
  it("lets only the Admin change roles or remove people (FR-13, TC-14)", async () => {
    const { a, b, eventId, hamzaId } = await setup();
    expect((await b.changeRole(eventId, hamzaId, "admin")).ok).toBe(false);
    expect((await a.changeRole(eventId, hamzaId, "guest")).ok).toBe(true);
    expect((await a.removeMember(eventId, hamzaId)).ok).toBe(true);
    expect(await b.listMyEvents()).toEqual([]);
  });
  it("blocks demoting or removing the last Admin (TC-09)", async () => {
    const { a, b, eventId, hamzaId, rashidId } = await setup();
    const demote = await a.changeRole(eventId, rashidId, "member");
    expect(demote).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    const remove = await a.removeMember(eventId, rashidId);
    expect(remove).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    await a.changeRole(eventId, hamzaId, "admin");
    expect((await a.changeRole(eventId, rashidId, "member")).ok).toBe(true);
    expect((await b.removeMember(eventId, rashidId)).ok).toBe(true);
  });
});
