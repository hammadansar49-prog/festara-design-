import { CalendarDays, Check, Link2, MapPin, Users } from "lucide-react";
import { RoleBadge } from "@/components/role-badge";
import { COVER_COLORS } from "@/lib/constants";

const MEMBERS = [
  { name: "Rashid Mehmood", role: "admin" },
  { name: "Hamza Rashid", role: "member" },
  { name: "Sana Rashid", role: "member" },
  { name: "Tariq Mehmood", role: "guest" },
] as const;

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("");

/** Step 1: the new event with its cover color picked. */
export function PanelCreate() {
  return (
    <div className="story-panel grid grid-cols-1 gap-4 rounded-xl border bg-card p-5 sm:p-6">
      <p className="lbl text-muted-foreground">New event</p>
      <article className="overflow-hidden rounded-lg border bg-card">
        <div className="flex min-h-40 flex-col justify-end gap-1.5 p-5" style={{ background: "var(--event-mehndi)", color: "var(--event-mehndi-fg)" }}>
          <span className="lbl opacity-85">Mehndi</span>
          <p className="font-display text-[1.75rem]">Ayesha&rsquo;s Mehndi</p>
        </div>
        <div className="grid gap-2 p-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalendarDays className="size-4" aria-hidden />Mon 14 Dec 2026</div>
          <div className="flex items-center gap-2"><MapPin className="size-4" aria-hidden />Lahore</div>
        </div>
      </article>
      <div className="flex items-center gap-2" aria-hidden>
        <span className="mr-1 text-sm text-muted-foreground">Cover</span>
        {COVER_COLORS.map((c) => (
          <span key={c} className="size-6 rounded-md" style={{ background: `var(--event-${c})`, outline: c === "mehndi" ? "2px solid var(--ink)" : undefined, outlineOffset: 2 }} />
        ))}
      </div>
    </div>
  );
}

/** Step 2: the link is copied and posted in the family chat. */
export function PanelShare() {
  return (
    <div className="story-panel grid grid-cols-1 content-center gap-5 rounded-xl border bg-card p-5 sm:p-6">
      <p className="lbl text-muted-foreground">Invite link</p>
      <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
        <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm">festara.app/invite/k3x9-ayesha-mehndi</span>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"><Check className="size-3.5" aria-hidden />Copied</span>
      </div>
      <p className="text-sm text-muted-foreground">Works for 7 days. Anyone with the link sees the event before they sign up.</p>
      <div className="ml-auto grid max-w-[18rem] gap-2 rounded-2xl rounded-br-sm bg-primary p-4 text-primary-foreground">
        <span className="text-sm">Everyone join here for the mehndi plan</span>
        <span className="truncate rounded-md bg-primary-foreground/10 px-2 py-1 text-xs">festara.app/invite/k3x9&hellip;</span>
      </div>
    </div>
  );
}

/** Step 3: everyone who joined, each with the right role. */
export function PanelRoles() {
  return (
    <div className="story-panel grid grid-cols-1 content-center gap-3 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="lbl text-muted-foreground">People</p>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="size-4" aria-hidden />4 in</span>
      </div>
      <ul className="grid gap-2">
        {MEMBERS.map((m) => (
          <li key={m.name} className="flex items-center gap-3 rounded-lg border bg-background p-3">
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold">{initials(m.name)}</span>
            <span className="flex-1 text-sm font-medium">{m.name}</span>
            <RoleBadge role={m.role} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export const STEPS = [
  { n: "01", title: "Create the event", body: "Name it, set the date and place, pick a cover color. You become its Admin." },
  { n: "02", title: "Share one link", body: "Send it on WhatsApp. It shows the event before anyone has to sign up." },
  { n: "03", title: "Set each role", body: "Promote a helper, keep a guest to the basics. An event always keeps one Admin." },
] as const;
