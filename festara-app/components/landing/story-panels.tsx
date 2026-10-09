"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { EventArt } from "@/components/brand/event-art";
import { COVER_COLORS, COVER_LABELS, type CoverColor } from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = { admin: "Admin", member: "Member", guest: "Guest" };
const ROLE_CLASS: Record<Role, string> = {
  admin: "bg-primary text-primary-foreground",
  member: "bg-marigold/25 text-foreground",
  guest: "bg-secondary text-muted-foreground",
};
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("");

/** Step 1: a new event. Try the colours. */
export function PanelCreate() {
  const [cover, setCover] = useState<CoverColor>("mehndi");
  return (
    <div className="story-panel grid gap-4 rounded-2xl border bg-background p-4 sm:p-5">
      <p className="lbl text-muted-foreground">New event</p>
      <article className="overflow-hidden rounded-xl border bg-card">
        <div
          data-cover={cover}
          className="cover flex min-h-44 flex-col justify-end gap-1.5 p-5 transition-[background-color] duration-500"
          style={{ background: `var(--event-${cover})`, color: `var(--event-${cover}-fg)` }}
        >
          <EventArt type="mehndi" className="-right-3 -bottom-4 w-40" />
          <span className="lbl opacity-85">Mehndi</span>
          <p className="font-display text-3xl">Ayesha&rsquo;s Mehndi</p>
        </div>
        <div className="flex gap-4 p-4 text-sm text-muted-foreground"><span>Mon 14 Dec 2026</span><span>Lahore</span></div>
      </article>
      <div role="radiogroup" aria-label="Cover colour" className="flex flex-wrap items-center gap-2.5">
        {COVER_COLORS.map((c) => (
          <button
            key={c} type="button" role="radio" aria-checked={cover === c} aria-label={COVER_LABELS[c]} onClick={() => setCover(c)}
            className="size-10 rounded-2xl transition-transform duration-300 hover:-translate-y-0.5 aria-checked:scale-110 aria-checked:ring-2 aria-checked:ring-foreground aria-checked:ring-offset-2 aria-checked:ring-offset-background"
            style={{ background: `var(--event-${c})` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Step 2: the link is copied and posted in the family chat. */
export function PanelShare() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="story-panel grid content-center gap-4 rounded-2xl border bg-background p-4 sm:p-5">
      <p className="lbl text-muted-foreground">Invite link</p>
      <div className="flex items-center gap-3 rounded-xl border bg-card p-2 pl-4">
        <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">festara.app/invite/k3x9-ayesha-mehndi</span>
        <button
          type="button" onClick={() => setCopied(true)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {copied ? <><Check className="size-3.5" aria-hidden />Copied</> : "Copy"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Works for 7 days. Anyone with the link sees the event before they sign up.</p>
      <div
        aria-live="polite"
        className={cn(
          "ml-auto grid max-w-[18rem] gap-2 rounded-2xl rounded-br-sm bg-[#1F6E4A] p-4 text-[#EAFBF1] transition-all duration-700",
          copied ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0",
        )}
      >
        <span className="text-sm">Everyone join here for the mehndi plan</span>
        <span className="truncate rounded-lg bg-white/15 px-2 py-1 font-mono text-xs">festara.app/invite/k3x9&hellip;</span>
      </div>
    </div>
  );
}

/** Step 3: everyone who joined, each with the right role. Tap a role to change it. An event always keeps one Admin. */
export function PanelRoles() {
  const [people, setPeople] = useState<{ name: string; role: Role }[]>([
    { name: "Rashid Mehmood", role: "admin" },
    { name: "Hamza Rashid", role: "member" },
    { name: "Sana Rashid", role: "member" },
    { name: "Tariq Mehmood", role: "guest" },
  ]);
  const [note, setNote] = useState("");
  const cycle = (i: number) => {
    const order: Role[] = ["admin", "member", "guest"];
    const p = people[i];
    if (p.role === "admin" && people.filter((x) => x.role === "admin").length === 1) { setNote("An event always keeps one Admin."); return; }
    setNote("");
    setPeople(people.map((x, j) => (j === i ? { ...x, role: order[(order.indexOf(x.role) + 1) % 3] } : x)));
  };
  return (
    <div className="story-panel grid content-center gap-3 rounded-2xl border bg-background p-4 sm:p-5">
      <p className="lbl text-muted-foreground">People · tap a role</p>
      <ul className="grid gap-2">
        {people.map((m, i) => (
          <li key={m.name} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold">{initials(m.name)}</span>
            <span className="flex-1 text-sm font-semibold">{m.name}</span>
            <button
              type="button" onClick={() => cycle(i)} aria-label={`Change role for ${m.name}, now ${ROLE_LABEL[m.role]}`}
              className={cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-colors", ROLE_CLASS[m.role])}
            >
              {ROLE_LABEL[m.role]}
            </button>
          </li>
        ))}
      </ul>
      <p role="status" className="min-h-5 text-sm text-warn">{note}</p>
    </div>
  );
}
