import { Check, Minus } from "lucide-react";
import { ROLES, can, type Action } from "@/lib/permissions";

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

/** Rendered from the same can() table the server checks, so it cannot drift from the real rules. */
export function PermissionMatrix() {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">What each role can do in an event</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="p-3 text-sm font-medium text-muted-foreground sm:p-4">Can they&hellip;</th>
            {ROLES.map((r) => <th key={r} scope="col" className="px-2 py-3 text-center text-sm font-semibold sm:p-4">{TITLE[r]}</th>)}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ action, label }) => (
            <tr key={action} className="border-b last:border-0">
              <th scope="row" className="p-3 text-sm font-normal sm:p-4">{label}</th>
              {ROLES.map((r) => (
                <td key={r} className="px-2 py-3 text-center sm:p-4">
                  {can(r, action)
                    ? <><Check className="mx-auto size-5 text-ok" aria-hidden /><span className="sr-only">Yes</span></>
                    : <><Minus className="mx-auto size-5 text-muted-foreground" aria-hidden /><span className="sr-only">No</span></>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
