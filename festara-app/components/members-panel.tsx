"use client";

import { Check, Copy, Link2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RoleBadge } from "@/components/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changeRoleAction, createInvitationAction, removeMemberAction } from "@/lib/actions/members";
import type { InviteRole, Member } from "@/lib/data/types";
import { can, type Action, type Role } from "@/lib/permissions";
import { initials } from "@/lib/text";

const ROLE_BLURB: Record<Role, string> = { admin: "Runs the event", member: "Helps plan", guest: "Just attends" };
const ABILITIES: { action: Action; label: string }[] = [
  { action: "event.viewBasic", label: "Sees the date and place" },
  { action: "event.viewFull", label: "Sees the full plan" },
  { action: "guest.add", label: "Adds guests" },
  { action: "invite.create", label: "Creates invite links" },
  { action: "member.manage", label: "Changes roles" },
];

/** Three cards, one per role, built from the same can() table the server checks. */
function RoleCards({ members }: { members: Member[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3" aria-label="What each role can do">
      {(["admin", "member", "guest"] as const).map((r) => (
        <li key={r} className="grid content-start gap-3 rounded-[20px] border bg-card p-5 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-overlay)]">
          <div className="flex items-center justify-between"><RoleBadge role={r} /><span className="font-display text-4xl tabular-nums">{members.filter((m) => m.role === r).length}</span></div>
          <p className="font-semibold">{ROLE_BLURB[r]}</p>
          <ul className="grid gap-1.5 text-sm text-muted-foreground">
            {ABILITIES.filter((a) => can(r, a.action)).map((a) => (
              <li key={a.action} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-ok-tint text-ok"><Check className="size-3" aria-hidden /></span>{a.label}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export type InviteView = { id: string; token: string; role: InviteRole; daysLeft: number };

export function MembersPanel({
  eventId, eventName, currentUserId, members, invites, canManage,
}: {
  eventId: string; eventName: string; currentUserId: string;
  members: Member[]; invites: InviteView[]; canManage: boolean;
}) {
  const [pending, start] = useTransition();
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [removing, setRemoving] = useState<Member | null>(null);

  function createLink() {
    start(async () => {
      const r = await createInvitationAction(eventId, inviteRole);
      if (r.ok) toast.success("Invite link created"); else toast.error(r.message);
    });
  }
  async function copy(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    try { await navigator.clipboard.writeText(url); toast.success("Invite link copied"); }
    catch { toast.error("Couldn't copy. Select the link and copy it by hand."); }
  }
  function changeRole(userId: string, role: Role) {
    start(async () => {
      const r = await changeRoleAction(eventId, userId, role);
      if (r.ok) toast.success("Role updated"); else toast.error(r.message);
    });
  }
  function confirmRemove() {
    if (!removing) return;
    const target = removing;
    start(async () => {
      const r = await removeMemberAction(eventId, target.userId);
      if (r.ok) toast.success(`${target.fullName} was removed`); else toast.error(r.message);
      setRemoving(null);
    });
  }

  return (
    <div className="grid max-w-4xl gap-10">
      <RoleCards members={members} />
      {canManage && (
        <section aria-labelledby="invite-h" className="grid gap-3">
          <h2 id="invite-h" className="font-display text-3xl">Invite link</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as InviteRole)}>
              <SelectTrigger aria-label="Role for this link" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">As Member</SelectItem>
                <SelectItem value="guest">As Guest</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createLink} disabled={pending}><Link2 className="size-4" aria-hidden />Create invite link</Button>
          </div>
          <p className="text-xs text-muted-foreground">Anyone with a link joins with the role you pick. It stops working after 7 days.</p>
          {invites.length > 0 && (
            <ul className="grid gap-2">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-xl border bg-card px-4 py-3 font-mono text-sm text-muted-foreground">/invite/{i.token}</code>
                  <RoleBadge role={i.role} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">{i.daysLeft} {i.daysLeft === 1 ? "day" : "days"} left</span>
                  <Button variant="outline" onClick={() => copy(i.token)}><Copy className="size-4" aria-hidden />Copy link</Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="people-h" className="grid gap-1">
        <h2 id="people-h" className="font-display text-3xl">{members.length} {members.length === 1 ? "person" : "people"}</h2>
        <ul>
          {members.map((m) => (
            <li key={m.userId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_9rem_2.5rem]">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-8"><AvatarFallback className="bg-secondary text-xs font-semibold">{initials(m.fullName)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.fullName}{m.userId === currentUserId && <span className="font-normal text-muted-foreground"> (you)</span>}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>
              {canManage ? (
                <>
                  <Select value={m.role} onValueChange={(v) => changeRole(m.userId, v as Role)} disabled={pending}>
                    <SelectTrigger aria-label={`Role for ${m.fullName}`} className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${m.fullName}`} onClick={() => setRemoving(m)} className="justify-self-end max-sm:col-start-2">
                    <X className="size-4" aria-hidden />
                  </Button>
                </>
              ) : (
                <RoleBadge role={m.role} className="justify-self-end sm:col-span-2" />
              )}
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Remove {removing?.fullName}?</DialogTitle>
            <DialogDescription>They lose access to {eventName}. You can invite them again later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Keep them</Button></DialogClose>
            <Button variant="destructive" onClick={confirmRemove} disabled={pending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
