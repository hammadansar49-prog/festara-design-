export const ROLES = ["admin", "member", "guest"] as const;
export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  "event.viewBasic",
  "event.viewFull",
  "event.edit",
  "event.delete",
  "invite.create",
  "member.manage",
  "guest.add",
  "expense.log",
  "task.create",
  "task.updateOwn",
  "rsvp.confirmOwn",
  "dashboard.view",
] as const;
export type Action = (typeof ACTIONS)[number];

// Report Table 5.2. The database enforces the same rules with RLS (supabase/migrations/0003_rls.sql).
const ALLOWED: Record<Action, readonly Role[]> = {
  "event.viewBasic": ["admin", "member", "guest"],
  "event.viewFull": ["admin", "member"],
  "event.edit": ["admin"],
  "event.delete": ["admin"],
  "invite.create": ["admin"],
  "member.manage": ["admin"],
  "guest.add": ["admin", "member"],
  "expense.log": ["admin", "member"],
  "task.create": ["admin"],
  "task.updateOwn": ["admin", "member"],
  "rsvp.confirmOwn": ["admin", "member", "guest"],
  "dashboard.view": ["admin"],
};

export function can(role: Role | null | undefined, action: Action): boolean {
  return role != null && ALLOWED[action].includes(role);
}
