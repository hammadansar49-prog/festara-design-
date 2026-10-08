import { Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MembersTable } from "@/components/dashboard/members-table";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { SectionCards } from "@/components/dashboard/section-cards";
import { Button } from "@/components/ui/button";
import { getDataSource } from "@/lib/data";
import { getEventCached } from "@/lib/data/queries";
import { daysUntil, formatEventDate } from "@/lib/date";
import { can } from "@/lib/permissions";
import { sampleDashboard } from "@/lib/sample-dashboard";

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role, memberCount } = result.data;
  const full = can(role, "event.viewFull");
  const members = full ? await (await getDataSource()).listMembers(id) : null;
  const sample = sampleDashboard(id, event.totalBudget, memberCount);

  return (
    <div className="grid gap-6">
      {/* phone: the event's own color floods the top, one big countdown */}
      <section
        className="-mx-4 -mt-8 grid gap-1 rounded-b-3xl px-4 pt-6 pb-6 sm:-mx-8 sm:px-8 md:hidden"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
        aria-label="Event summary"
      >
        <h1 className="font-display text-3xl">{event.name}</h1>
        <p className="font-display text-6xl leading-none">
          {Math.max(daysUntil(event.eventDate), 0)} <span className="font-sans text-base">days to go</span>
        </p>
        <p className="text-sm opacity-80">{[formatEventDate(event.eventDate), event.location].filter(Boolean).join(" · ")}</p>
      </section>
      {event.description && <p className="max-w-prose">{event.description}</p>}
      {can(role, "invite.create") && (
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href={`/events/${id}/members`}><Link2 className="size-4" aria-hidden />Invite people</Link></Button>
          <Button asChild variant="outline"><Link href={`/events/${id}/settings`}>Edit event</Link></Button>
        </div>
      )}
      {full ? (
        <>
          <SectionCards
            days={daysUntil(event.eventDate)} members={memberCount} confirmed={sample.confirmed}
            invited={sample.invited} spent={sample.spent} budget={event.totalBudget}
          />
          <OverviewChart points={sample.points} />
          {members?.ok && (
            <MembersTable members={members.data} manageHref={can(role, "member.manage") ? `/events/${id}/members` : undefined} />
          )}
        </>
      ) : (
        <p className="text-muted-foreground">You are a guest of this event. You can see its date, place and details.</p>
      )}
    </div>
  );
}
