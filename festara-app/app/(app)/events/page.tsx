import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
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

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <span className="lbl text-muted-foreground">{user.fullName}</span>
          <h1 className="font-display text-[2rem]">Your events</h1>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Event filter" className="inline-flex rounded-md bg-secondary p-0.5 text-sm font-medium">
            <Link href="/events" aria-current={!past ? "page" : undefined} className={`rounded-sm px-3 py-1.5 ${!past ? "bg-card" : "text-muted-foreground"}`}>Upcoming</Link>
            <Link href="/events?show=past" aria-current={past ? "page" : undefined} className={`rounded-sm px-3 py-1.5 ${past ? "bg-card" : "text-muted-foreground"}`}>Past</Link>
          </nav>
          <Button asChild><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-lg border border-dashed p-8">
          <p className="max-w-prose">
            {past ? "No past events." : "No events yet. Create one, or open an invite link someone sent you."}
          </p>
          {!past && <Button asChild variant="outline"><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>}
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id}><EventCard event={e} href={`/events/${e.id}`} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
