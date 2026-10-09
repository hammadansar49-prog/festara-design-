import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { NextUp } from "@/components/next-up";
import { Button } from "@/components/ui/button";
import { getDataSource } from "@/lib/data";

export const metadata: Metadata = { title: "Your events" };

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const past = show === "past";
  const ds = await getDataSource();
  const user = (await ds.getCurrentUser())!;
  const today = new Date().toLocaleDateString("en-CA");
  const all = await ds.listMyEvents();
  const events = all.filter((e) => (past ? e.eventDate < today : e.eventDate >= today));
  if (past) events.reverse();
  else events.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const next = !past ? events[0] : undefined;

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3">
          <span className="lbl text-muted-foreground">{user.fullName}</span>
          <h1 className="font-display text-5xl sm:text-7xl">Your <span className="accent">events</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Event filter" className="inline-flex rounded-full bg-secondary p-1 text-sm font-semibold">
            <Link href="/events" aria-current={!past ? "page" : undefined} className={`rounded-full px-4 py-2 ${!past ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Upcoming</Link>
            <Link href="/events?show=past" aria-current={past ? "page" : undefined} className={`rounded-full px-4 py-2 ${past ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Past</Link>
          </nav>
          <Button asChild><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>
        </div>
      </div>

      {next && <NextUp event={next} />}

      {events.length === 0 ? (
        <div className="grid justify-items-start gap-4 rounded-[28px] border-2 border-dashed p-8 sm:p-10">
          <p className="max-w-prose text-lg">
            {past ? "No past events." : "No events yet. Create one, or open an invite link someone sent you."}
          </p>
          {!past && <Button asChild variant="outline"><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>}
        </div>
      ) : (
        <section className="grid gap-5" aria-label={past ? "Past events" : "All upcoming events"}>
          {!past && <h2 className="font-display text-3xl">All upcoming</h2>}
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((e) => (
              <li key={e.id}><EventCard event={e} href={`/events/${e.id}`} /></li>
            ))}
            {!past && (
              <li>
                <Link href="/events/new" className="group grid h-full min-h-72 place-content-center justify-items-center gap-3 rounded-[24px] border-2 border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-marigold hover:bg-marigold/5 hover:text-foreground">
                  <span className="grid size-16 place-items-center rounded-2xl bg-marigold text-[#17141B] transition-transform duration-500 group-hover:rotate-90"><Plus className="size-7" aria-hidden /></span>
                  <span className="font-display text-2xl text-foreground">New event</span>
                  <span className="text-sm">Wedding, trip, society or anything</span>
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
