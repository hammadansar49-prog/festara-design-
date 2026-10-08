import { randomBytes, randomUUID } from "node:crypto";
import { INVITE_DAYS } from "@/lib/constants";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS, NOT_SIGNED_IN } from "@/lib/messages";
import { can, type Role } from "@/lib/permissions";
import type { RegisterInput } from "@/lib/validation/auth";
import type { EventInput } from "@/lib/validation/event";
import type { ProfileInput } from "@/lib/validation/profile";
import { fail, ok, type Result } from "./result";
import type {
  DataSource, EventDetail, EventRecord, EventSummary, Invitation, InvitePreview, InviteRole, Member, Profile,
} from "./types";

export interface SessionStore {
  get(): Promise<string | undefined>;
  set(userId: string): Promise<void>;
  clear(): Promise<void>;
}

type UserRow = Profile & { password: string };
type MemberRow = { eventId: string; userId: string; role: Role; joinedAt: string };
type InviteRow = Invitation & { createdBy: string };
export interface Store { users: UserRow[]; events: EventRecord[]; members: MemberRow[]; invitations: InviteRow[] }
export const createStore = (): Store => ({ users: [], events: [], members: [], invitations: [] });

export interface MockDeps {
  session: SessionStore;
  now?: () => Date;
  newId?: () => string;
  newToken?: () => string;
}

const DAY = 86_400_000;
const toProfile = (u: UserRow): Profile => ({ id: u.id, fullName: u.fullName, email: u.email, phone: u.phone });

/**
 * In-memory DataSource used for the UI-first prototype and unit tests.
 * It enforces the same rules as the database: roles, last Admin, expiry, already-member keeps role.
 */
export class MockDataSource implements DataSource {
  private session: SessionStore;
  private now: () => Date;
  private newId: () => string;
  private newToken: () => string;

  constructor(private store: Store, deps: MockDeps) {
    this.session = deps.session;
    this.now = deps.now ?? (() => new Date());
    this.newId = deps.newId ?? randomUUID;
    this.newToken = deps.newToken ?? (() => randomBytes(16).toString("base64url"));
  }

  // ---- helpers ----
  private async me(): Promise<Profile | null> {
    const id = await this.session.get();
    const row = id ? this.store.users.find((u) => u.id === id) : undefined;
    return row ? toProfile(row) : null;
  }
  private roleOf(eventId: string, userId: string): Role | null {
    return this.store.members.find((m) => m.eventId === eventId && m.userId === userId)?.role ?? null;
  }
  private adminCount(eventId: string): number {
    return this.store.members.filter((m) => m.eventId === eventId && m.role === "admin").length;
  }
  private memberCount(eventId: string): number {
    return this.store.members.filter((m) => m.eventId === eventId).length;
  }
  private isActive(inv: InviteRow): boolean {
    return new Date(inv.expiresAt).getTime() > this.now().getTime();
  }

  // ---- auth and profile ----
  async signUp(input: RegisterInput) {
    if (this.store.users.some((u) => u.email === input.email)) {
      return fail("exists", "An account with this email already exists. Sign in instead.");
    }
    const row: UserRow = { id: this.newId(), fullName: input.fullName, email: input.email, phone: null, password: input.password };
    this.store.users.push(row);
    await this.session.set(row.id);
    return ok({ needsConfirmation: false });
  }
  async signIn(input: { email: string; password: string }) {
    const row = this.store.users.find((u) => u.email === input.email && u.password === input.password);
    if (!row) return fail("auth", "Invalid login credentials");
    await this.session.set(row.id);
    return ok(toProfile(row));
  }
  async signOut() {
    await this.session.clear();
  }
  async requestPasswordReset(_email: string) {
    return ok(null); // never reveal whether an address has an account
  }
  async resetPassword(newPassword: string) {
    const id = await this.session.get();
    const row = this.store.users.find((u) => u.id === id);
    if (!row) return fail("auth", "Your reset link has expired. Request a new one.");
    row.password = newPassword;
    return ok(null);
  }
  getCurrentUser() {
    return this.me();
  }
  async updateProfile(input: ProfileInput) {
    const id = await this.session.get();
    const row = this.store.users.find((u) => u.id === id);
    if (!row) return fail("auth", NOT_SIGNED_IN);
    row.fullName = input.fullName;
    row.phone = input.phone;
    return ok(toProfile(row));
  }

  // ---- events ----
  async listMyEvents(): Promise<EventSummary[]> {
    const user = await this.me();
    if (!user) return [];
    return this.store.events
      .map((e) => ({ e, role: this.roleOf(e.id, user.id) }))
      .filter((x): x is { e: EventRecord; role: Role } => x.role !== null)
      .map(({ e, role }) => ({ ...e, role, memberCount: this.memberCount(e.id) }))
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }
  async getEvent(eventId: string): Promise<Result<EventDetail>> {
    const user = await this.me();
    const role = user ? this.roleOf(eventId, user.id) : null;
    const event = this.store.events.find((e) => e.id === eventId);
    if (!user || !role || !event) return fail("not_found", NO_ACCESS);
    return ok({ event, role, memberCount: this.memberCount(eventId) });
  }
  async createEvent(input: EventInput): Promise<Result<EventRecord>> {
    const user = await this.me();
    if (!user) return fail("auth", NOT_SIGNED_IN);
    const event: EventRecord = { id: this.newId(), ...input, createdBy: user.id, createdAt: this.now().toISOString() };
    this.store.events.push(event);
    this.store.members.push({ eventId: event.id, userId: user.id, role: "admin", joinedAt: event.createdAt });
    return ok(event);
  }
  async updateEvent(eventId: string, input: EventInput): Promise<Result<EventRecord>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.edit")) return fail("forbidden", "Only the Admin can edit this event.");
    Object.assign(detail.data.event, input);
    return ok(detail.data.event);
  }
  async deleteEvent(eventId: string, confirmName: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.delete")) return fail("forbidden", "Only the Admin can delete this event.");
    if (confirmName.trim() !== detail.data.event.name) return fail("invalid", "Type the event name exactly to confirm.");
    this.store.events = this.store.events.filter((e) => e.id !== eventId);
    this.store.members = this.store.members.filter((m) => m.eventId !== eventId);
    this.store.invitations = this.store.invitations.filter((i) => i.eventId !== eventId);
    return ok(null);
  }

  // ---- members ----
  async listMembers(eventId: string): Promise<Result<Member[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.viewFull")) return fail("forbidden", "You don't have access to the member list.");
    const order: Record<Role, number> = { admin: 0, member: 1, guest: 2 };
    const members = this.store.members
      .filter((m) => m.eventId === eventId)
      .map((m) => {
        const u = this.store.users.find((x) => x.id === m.userId)!;
        return { userId: u.id, fullName: u.fullName, email: u.email, role: m.role, joinedAt: m.joinedAt };
      })
      .sort((a, b) => order[a.role] - order[b.role] || a.joinedAt.localeCompare(b.joinedAt));
    return ok(members);
  }
  async changeRole(eventId: string, userId: string, role: Role): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can change roles.");
    const target = this.store.members.find((m) => m.eventId === eventId && m.userId === userId);
    if (!target) return fail("not_found", "That person isn't a member of this event.");
    if (target.role === "admin" && role !== "admin" && this.adminCount(eventId) === 1) return fail("last_admin", LAST_ADMIN);
    target.role = role;
    return ok(null);
  }
  async removeMember(eventId: string, userId: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can remove people.");
    const target = this.store.members.find((m) => m.eventId === eventId && m.userId === userId);
    if (!target) return fail("not_found", "That person isn't a member of this event.");
    if (target.role === "admin" && this.adminCount(eventId) === 1) return fail("last_admin", LAST_ADMIN);
    this.store.members = this.store.members.filter((m) => m !== target);
    return ok(null);
  }

  // ---- invitations ----
  async createInvitation(eventId: string, role: InviteRole): Promise<Result<Invitation>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can create invite links.");
    const user = (await this.me())!;
    const row: InviteRow = {
      id: this.newId(), eventId, token: this.newToken(), role,
      expiresAt: new Date(this.now().getTime() + INVITE_DAYS * DAY).toISOString(),
      usedCount: 0, createdBy: user.id,
    };
    this.store.invitations.push(row);
    return ok(row);
  }
  async listInvitations(eventId: string): Promise<Result<Invitation[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can see invite links.");
    return ok(this.store.invitations.filter((i) => i.eventId === eventId && this.isActive(i)));
  }
  async getInvitationPreview(token: string): Promise<Result<InvitePreview>> {
    const inv = this.store.invitations.find((i) => i.token === token);
    const event = inv && this.isActive(inv) ? this.store.events.find((e) => e.id === inv.eventId) : undefined;
    if (!inv || !event) return fail("invite_invalid", INVITE_INVALID);
    const inviter = this.store.users.find((u) => u.id === inv.createdBy);
    return ok({
      eventName: event.name, eventDate: event.eventDate, location: event.location,
      coverColor: event.coverColor, inviterName: inviter?.fullName ?? "The organiser", role: inv.role,
    });
  }
  async acceptInvitation(token: string): Promise<Result<{ eventId: string }>> {
    const user = await this.me();
    if (!user) return fail("auth", "Sign in to join this event.");
    const inv = this.store.invitations.find((i) => i.token === token);
    if (!inv || !this.isActive(inv)) return fail("invite_invalid", INVITE_INVALID);
    if (this.roleOf(inv.eventId, user.id)) return ok({ eventId: inv.eventId }); // already a member: keep role
    this.store.members.push({ eventId: inv.eventId, userId: user.id, role: inv.role, joinedAt: this.now().toISOString() });
    inv.usedCount += 1;
    return ok({ eventId: inv.eventId });
  }
}
