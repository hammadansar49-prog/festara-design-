import type { CoverColor, EventType } from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import type { RegisterInput } from "@/lib/validation/auth";
import type { EventInput } from "@/lib/validation/event";
import type { ProfileInput } from "@/lib/validation/profile";
import type { Result } from "./result";

export interface Profile { id: string; fullName: string; email: string; phone: string | null }

export interface EventRecord {
  id: string;
  name: string;
  type: EventType;
  eventDate: string; // YYYY-MM-DD
  location: string | null;
  description: string | null;
  totalBudget: number;
  coverColor: CoverColor;
  createdBy: string;
  createdAt: string; // ISO
}
export interface EventSummary extends EventRecord { role: Role; memberCount: number }
export interface EventDetail { event: EventRecord; role: Role; memberCount: number }

export interface Member { userId: string; fullName: string; email: string; role: Role; joinedAt: string }

export type InviteRole = "member" | "guest";
export interface Invitation { id: string; eventId: string; token: string; role: InviteRole; expiresAt: string; usedCount: number }
export interface InvitePreview {
  eventName: string;
  eventDate: string;
  location: string | null;
  coverColor: CoverColor;
  inviterName: string;
  role: InviteRole;
}

export interface DataSource {
  // auth and profile (FR-01 to FR-04)
  signUp(input: RegisterInput): Promise<Result<{ needsConfirmation: boolean }>>;
  signIn(input: { email: string; password: string }): Promise<Result<Profile>>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<Result<null>>;
  resetPassword(newPassword: string): Promise<Result<null>>;
  getCurrentUser(): Promise<Profile | null>;
  updateProfile(input: ProfileInput): Promise<Result<Profile>>;

  // events (FR-05 to FR-09)
  listMyEvents(): Promise<EventSummary[]>;
  getEvent(eventId: string): Promise<Result<EventDetail>>;
  createEvent(input: EventInput): Promise<Result<EventRecord>>;
  updateEvent(eventId: string, input: EventInput): Promise<Result<EventRecord>>;
  deleteEvent(eventId: string, confirmName: string): Promise<Result<null>>;

  // members and invitations (FR-10 to FR-14)
  listMembers(eventId: string): Promise<Result<Member[]>>;
  changeRole(eventId: string, userId: string, role: Role): Promise<Result<null>>;
  removeMember(eventId: string, userId: string): Promise<Result<null>>;
  createInvitation(eventId: string, role: InviteRole): Promise<Result<Invitation>>;
  listInvitations(eventId: string): Promise<Result<Invitation[]>>;
  getInvitationPreview(token: string): Promise<Result<InvitePreview>>;
  acceptInvitation(token: string): Promise<Result<{ eventId: string }>>;
}
