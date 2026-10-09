"use client";

import { Check, Minus } from "lucide-react";
import { useState } from "react";
import { can, ROLES, type Action, type Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ROWS: { action: Action; label: string }[] = [
  { action: "event.viewBasic", label: "See the date and place" },
  { action: "event.viewFull", label: "See the full plan" },
  { action: "guest.add", label: "Add guests" },
  { action: "event.edit", label: "Edit the event" },
  { action: "invite.create", label: "Create invite links" },
  { action: "member.manage", label: "Change roles, remove people" },
  { action: "event.delete", label: "Delete the event" },
];

const TITLE = { admin: "Admin", member: "Member", guest: "Guest" } as const;

/** Rendered from the same can() table the server checks, so it cannot drift from the real rules. Pick a role to light up its column. */
export function PermissionMatrix() {
  const [role, setRole] = useState<Role>("member");
  return (
    <div className="grid gap-4">
      <div role="group" aria-label="Highlight a role" className="inline-flex w-fit gap-1 rounded-full bg-secondary p-1">
        {ROLES.map((r) => (
          <button
            key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)}
            className="h-10 rounded-full px-5 text-sm font-semibold text-muted-foreground transition-colors aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {TITLE[r]}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">What each role can do in an event</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-3 text-sm font-medium text-muted-foreground sm:p-4">Can they&hellip;</th>
              {ROLES.map((r) => <th key={r} scope="col" className={cn("px-2 py-3 text-center text-sm font-bold sm:p-4", role === r && "matrix-hl")}>{TITLE[r]}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ action, label }) => (
              <tr key={action} className="border-b last:border-0" data-reveal-row>
                <th scope="row" className="p-3 text-sm font-normal sm:p-4">{label}</th>
                {ROLES.map((r) => (
                  <td key={r} className={cn("px-2 py-3 text-center sm:p-4", role === r && "matrix-hl")}>
                    {can(r, action)
                      ? <><span className="mx-auto grid size-7 place-items-center rounded-full bg-ok-tint text-ok"><Check className="size-4" aria-hidden /></span><span className="sr-only">Yes</span></>
                      : <><Minus className="mx-auto size-5 text-muted-foreground/60" aria-hidden /><span className="sr-only">No</span></>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
