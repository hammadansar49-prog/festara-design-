import { CalendarClock, ReceiptText, UserCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export function SampleChip() {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-dashed px-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
      Sample
    </span>
  );
}

function Stat({ label, value, hint, Icon, sample, children }: {
  label: string; value: string; hint: string; Icon: typeof Users; sample?: boolean; children?: React.ReactNode;
}) {
  return (
    <Card className="gap-3">
      <div className="flex min-h-5 items-center justify-between gap-2 px-(--card-spacing)">
        <CardDescription className="flex items-center gap-2"><Icon className="size-4" aria-hidden />{label}</CardDescription>
        {sample && <SampleChip />}
      </div>
      <CardContent className="grid gap-2">
        <CardTitle className="font-display text-[2rem] tabular-nums">{value}</CardTitle>
        {children}
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function SectionCards({ days, members, confirmed, invited, spent, budget }: {
  days: number; members: number; confirmed: number; invited: number; spent: number; budget: number;
}) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Days to go"
        Icon={CalendarClock}
        value={days > 0 ? String(days) : days === 0 ? "Today" : "Passed"}
        hint={days > 0 ? "Until the event date" : days === 0 ? "It is happening now" : "This event has finished"}
      />
      <Stat label="Members" Icon={Users} value={String(members)} hint="People with an account in this event" />
      <Stat label="Guests confirmed" Icon={UserCheck} value={`${confirmed} / ${invited}`} sample hint="Guests and RSVP arrive in a later phase" />
      <Stat label="Budget used" Icon={ReceiptText} value={formatMoney(spent)} sample hint={`${pct}% of ${formatMoney(budget)}`}>
        <div
          role="progressbar" aria-label="Budget used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
          className="h-1.5 overflow-hidden rounded-full bg-secondary"
        >
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 90 ? "var(--over)" : "var(--ink)" }} />
        </div>
      </Stat>
    </div>
  );
}
