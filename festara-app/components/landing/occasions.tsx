import { Link2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { RoleBadge } from "@/components/role-badge";
import type { CoverColor } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

const muted = "text-[var(--event-night-fg)]/70";
const chip = "grid gap-3 rounded-xl border border-[var(--event-night-fg)]/15 p-4 text-sm";

/** Budget is Planned for the 40% build, so this one is labelled Sample. */
function BudgetChip() {
  return (
    <div className={chip}>
      <div className="flex items-center justify-between gap-3">
        <span className={muted}>Spent of budget</span>
        <span className="lbl rounded-full border border-[var(--event-night-fg)]/25 px-2 py-0.5">Sample</span>
      </div>
      <p className="font-medium">{formatMoney(410_000)} <span className={muted}>of {formatMoney(500_000)}</span></p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--event-night-fg)]/15" aria-hidden>
        <div data-meter className="h-full w-full origin-left rounded-full bg-[var(--event-marigold)]" style={{ transform: "scaleX(.82)" }} />
      </div>
      <p data-meter-note className="flex items-center gap-2"><TriangleAlert className="size-4 shrink-0" aria-hidden />82% used, close to the limit</p>
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
            <span key={p} className="grid size-8 place-items-center rounded-full border-2 border-[var(--event-night)] bg-[var(--event-sky)] text-[0.6875rem] font-semibold">{p}</span>
          ))}
        </div>
        <span className={muted}>9 people</span>
      </div>
      <p>1 Admin, 6 Members, 2 Guests</p>
    </div>
  );
}

function InviteChip() {
  return (
    <div className={chip}>
      <div className="flex items-center gap-2">
        <Link2 className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 font-medium">Volunteers link</span>
        <RoleBadge role="member" />
      </div>
      <p className={muted}>Joins as Member. Works for 7 days.</p>
    </div>
  );
}

const OCCASIONS: { label: string; cover: CoverColor; name: string; title: string; body: string; chip: ReactNode }[] = [
  {
    label: "Wedding", cover: "sindoor", name: "Mehndi, baraat, walima",
    title: "Many functions, one family.",
    body: "Each function gets its own event. Cousins help plan, elders see the details, and nobody changes the date by accident.",
    chip: <BudgetChip />,
  },
  {
    label: "Trip", cover: "sky", name: "Naran, four days",
    title: "Friends who actually commit.",
    body: "One link in the group chat. Everyone who joins sees the plan, and you decide who can change it.",
    chip: <PeopleChip />,
  },
  {
    label: "Society", cover: "marigold", name: "Spring Tech Fest",
    title: "A team that changes every semester.",
    body: "Core team as Admins, volunteers as Members. Hand over by changing roles, not by sharing passwords.",
    chip: <InviteChip />,
  },
];

/** One card per kind of event: its cover color on one side, what Festara does for it on the other. */
export function Occasions() {
  return (
    <ol className="grid gap-6">
      {OCCASIONS.map((o) => (
        <li
          key={o.label}
          data-reveal
          className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-[var(--event-night-fg)]/15 bg-[color-mix(in_oklab,var(--event-night)_92%,var(--event-night-fg))] md:grid-cols-[1fr_1fr]"
        >
          <div
            className="flex min-h-56 flex-col justify-between gap-6 p-6 sm:p-8 md:min-h-80"
            style={{ background: `var(--event-${o.cover})`, color: `var(--event-${o.cover}-fg)` }}
          >
            <span className="lbl opacity-85">{o.label}</span>
            <p className="font-display max-w-[10ch] text-4xl leading-[1.05] sm:text-5xl">{o.name}</p>
          </div>
          <div className="grid content-between gap-6 p-6 sm:p-8">
            <div className="grid gap-3">
              <h3 className="font-display text-balance text-3xl">{o.title}</h3>
              <p className={`max-w-[38ch] ${muted}`}>{o.body}</p>
            </div>
            {o.chip}
          </div>
        </li>
      ))}
    </ol>
  );
}
