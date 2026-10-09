"use client";

import { Link2, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";
import { EventArt } from "@/components/brand/event-art";
import { RoleBadge } from "@/components/role-badge";
import type { CoverColor, EventType } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

const chip = "grid gap-3 rounded-2xl bg-black/25 p-4 text-sm backdrop-blur-sm";

/** Budget is Planned for the 40% build, so this one is labelled Sample. */
function BudgetChip() {
  return (
    <div className={chip}>
      <div className="flex items-center justify-between gap-3">
        <span className="opacity-80">Spent of budget</span>
        <span className="lbl rounded-full border border-current/40 px-2 py-0.5">Sample</span>
      </div>
      <p className="font-semibold">{formatMoney(410_000)} <span className="font-normal opacity-70">of {formatMoney(500_000)}</span></p>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/20" aria-hidden>
        <div className="h-full w-[82%] origin-left rounded-full bg-[var(--event-marigold)]" />
      </div>
      <p className="flex items-center gap-2"><TriangleAlert className="size-4 shrink-0" aria-hidden />82% used, close to the limit</p>
    </div>
  );
}

function PeopleChip() {
  const people = ["HR", "AK", "ZB", "UM", "FS"];
  return (
    <div className={chip}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex -space-x-2" aria-hidden>
          {people.map((p) => (
            <span key={p} className="grid size-8 place-items-center rounded-full border-2 border-[var(--event-sky)] bg-black/30 text-[0.6875rem] font-bold">{p}</span>
          ))}
        </div>
        <span className="opacity-80">9 people</span>
      </div>
      <p>1 Admin, 6 Members, 2 Guests</p>
    </div>
  );
}

function InviteChip() {
  return (
    <div className="grid gap-3 rounded-2xl bg-white/45 p-4 text-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Link2 className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 font-semibold">Volunteers link</span>
        <RoleBadge role="member" />
      </div>
      <p className="opacity-80">Joins as Member. Works for 7 days.</p>
    </div>
  );
}

const OCCASIONS: { label: string; cover: CoverColor; type: EventType; name: string; title: string; body: string; chip: ReactNode }[] = [
  {
    label: "Wedding", cover: "sindoor", type: "wedding", name: "Mehndi, baraat, walima",
    title: "Many functions, one family.",
    body: "Each function gets its own event. Cousins help plan, elders see the details, and nobody changes the date by accident.",
    chip: <BudgetChip />,
  },
  {
    label: "Trip", cover: "sky", type: "trip", name: "Naran, four days",
    title: "Friends who actually commit.",
    body: "One link in the group chat. Everyone who joins sees the plan, and you decide who can change it.",
    chip: <PeopleChip />,
  },
  {
    label: "Society", cover: "marigold", type: "university_event", name: "Spring Tech Fest",
    title: "A team that changes every semester.",
    body: "Core team as Admins, volunteers as Members. Hand over by changing roles, not by sharing passwords.",
    chip: <InviteChip />,
  },
];

/** One panel per kind of event. The open panel shows what Festara does for it; hover or tap another to open it. */
export function Occasions() {
  const [open, setOpen] = useState(0);
  return (
    <ol className="occasions" data-reveal>
      {OCCASIONS.map((o, i) => (
        <li key={o.label} className="contents">
          <button
            type="button" aria-expanded={open === i} onClick={() => setOpen(i)} onMouseEnter={() => matchMedia("(hover: hover)").matches && setOpen(i)}
            data-cover={o.cover} className="occasion cover"
            style={{ background: `var(--event-${o.cover})`, color: `var(--event-${o.cover}-fg)` }}
          >
            <EventArt type={o.type} />
            <span className="lbl opacity-85">{o.label}</span>
            <span className="font-display max-w-[10ch] text-4xl sm:text-5xl">{o.name}</span>
            <span className="more">
              <span className="font-serif text-3xl italic">{o.title}</span>
              <span className="opacity-90">{o.body}</span>
              {o.chip}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
