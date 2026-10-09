import { CalendarClock, ReceiptText, UserCheck, Users } from "lucide-react";
import { formatMoney } from "@/lib/format";

export function SampleChip() {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-dashed border-input px-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
      Sample
    </span>
  );
}

function Stat({ label, value, hint, Icon, sample, children }: {
  label: string; value: React.ReactNode; hint: string; Icon: typeof Users; sample?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-3 rounded-[20px] border bg-card p-5">
      <div className="flex min-h-5 items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><Icon className="size-4" aria-hidden />{label}</span>
        {sample && <SampleChip />}
      </div>
      <p className="font-display text-5xl tabular-nums">{value}</p>
      {children}
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function SectionCards({ days, members, confirmed, invited, spent, budget }: {
  days: number; members: number; confirmed: number; invited: number; spent: number; budget: number;
}) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const tone = pct > 90 ? "var(--over)" : pct >= 80 ? "var(--warn)" : "var(--marigold)";
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Days to go"
        Icon={CalendarClock}
        value={days > 0 ? String(days) : days === 0 ? "Today" : "Passed"}
        hint={days > 0 ? "Until the event date" : days === 0 ? "It is happening now" : "This event has finished"}
      />
      <Stat label="Members" Icon={Users} value={String(members)} hint="People with an account in this event" />
      <Stat label="Guests confirmed" Icon={UserCheck} value={<>{confirmed}<small className="font-sans text-xl font-semibold text-muted-foreground"> / {invited}</small></>} sample hint="Guests and RSVP arrive in a later phase" />
      <Stat label="Budget used" Icon={ReceiptText} value={<span className="text-[0.62em]">{formatMoney(spent)}</span>} sample hint={`${pct}% of ${formatMoney(budget)}`}>
        <div
          role="progressbar" aria-label="Budget used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
          className="h-2 overflow-hidden rounded-full bg-secondary"
        >
          <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${pct}%`, background: tone }} />
        </div>
      </Stat>
    </div>
  );
}
