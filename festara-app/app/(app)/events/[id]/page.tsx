import { CalendarDays, Check, Link2, MapPin, Minus } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MembersTable } from "@/components/dashboard/members-table";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { SectionCards } from "@/components/dashboard/section-cards";
import { Button } from "@/components/ui/button";
import { getDataSource } from "@/lib/data";
import { getEventCached } from "@/lib/data/queries";
import { daysUntil, formatEventDate } from "@/lib/date";
import { can, type Action } from "@/lib/permissions";
import { sampleDashboard } from "@/lib/sample-dashboard";

const GUEST_CAN: { action: Action; label: string }[] = [
  { action: "event.viewBasic", label: "See the date, place and details" },
  { action: "rsvp.confirmOwn", label: "Confirm you're coming, when RSVP opens" },
  { action: "event.viewFull", label: "See the full plan" },
  { action: "guest.add", label: "Add other guests" },
  { action: "event.edit", label: "Change the event" },
];

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role, memberCount } = result.data;
  const full = can(role, "event.viewFull");
  const members = full ? await (await getDataSource()).listMembers(id) : null;
  const sample = sampleDashboard(id, event.totalBudget, memberCount);

  return (
    <div className="grid gap-8">
      {event.description && <p className="max-w-prose text-lg">{event.description}</p>}
      {can(role, "invite.create") && (
        <div className="flex flex-wrap gap-2.5">
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
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="grid content-start gap-5 rounded-[24px] border bg-card p-6 sm:p-8">
            <span className="lbl text-muted-foreground">Your invitation</span>
            <h2 className="font-display text-4xl">See you <span className="accent">there.</span></h2>
            <p className="flex items-center gap-3 rounded-2xl bg-ok-tint p-4 font-semibold text-ok"><Check className="size-5" aria-hidden />You are on the guest list</p>
            <ul className="grid gap-3 text-lg">
              <li className="flex items-center gap-3"><CalendarDays className="size-5 text-muted-foreground" aria-hidden />{formatEventDate(event.eventDate)}</li>
              {event.location && <li className="flex items-center gap-3"><MapPin className="size-5 text-muted-foreground" aria-hidden />{event.location}</li>}
            </ul>
          </section>
          <section className="grid content-start gap-4 rounded-[24px] border bg-card p-6 sm:p-8">
            <span className="lbl text-muted-foreground">As a guest you can</span>
            <ul className="grid gap-3">
              {GUEST_CAN.map(({ action, label }) => {
                const ok = can(role, action);
                return (
                  <li key={action} className={`flex items-center gap-3 ${ok ? "" : "text-muted-foreground/70"}`}>
                    {ok
                      ? <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ok-tint text-ok"><Check className="size-3.5" aria-hidden /><span className="sr-only">Yes</span></span>
                      : <span className="grid size-6 shrink-0 place-items-center"><Minus className="size-4" aria-hidden /><span className="sr-only">No</span></span>}
                    {label}
                  </li>
                );
              })}
            </ul>
            <p className="text-sm text-muted-foreground">Want to help plan? Ask the Admin to make you a Member.</p>
          </section>
        </div>
      )}
    </div>
  );
}
