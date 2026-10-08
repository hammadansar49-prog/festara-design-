import { Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getEventCached } from "@/lib/data/queries";
import { daysUntil } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t pt-3">
      <dt className="lbl text-muted-foreground">{label}</dt>
      <dd className="font-display text-[2rem] tabular-nums">{value}</dd>
    </div>
  );
}

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role, memberCount } = result.data;
  const days = daysUntil(event.eventDate);

  return (
    <div className="grid gap-8">
      {event.description && <p className="max-w-prose">{event.description}</p>}
      {can(role, "event.viewFull") ? (
        <dl className="grid gap-6 sm:grid-cols-3">
          <Fact label="Days to go" value={days > 0 ? String(days) : days === 0 ? "Today" : "Passed"} />
          <Fact label="Members" value={String(memberCount)} />
          <Fact label="Total budget" value={formatMoney(event.totalBudget)} />
        </dl>
      ) : (
        <p className="text-muted-foreground">You are a guest of this event. You can see its date, place and details.</p>
      )}
      {can(role, "invite.create") && (
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href={`/events/${id}/members`}><Link2 className="size-4" aria-hidden />Invite people</Link></Button>
          <Button asChild variant="outline"><Link href={`/events/${id}/settings`}>Edit event</Link></Button>
        </div>
      )}
    </div>
  );
}
