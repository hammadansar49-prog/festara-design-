import { CalendarDays, MapPin, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import { EventArt } from "@/components/brand/event-art";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { getEventCached } from "@/lib/data/queries";
import { daysUntil, formatEventDate } from "@/lib/date";

const ROLE_LABEL = { admin: "Admin", member: "Member", guest: "Guest" } as const;

export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role } = result.data;
  const d = daysUntil(event.eventDate);

  return (
    <div className="grid gap-8">
      <header
        data-event-cover={event.coverColor}
        data-event-name={event.name}
        data-cover={event.coverColor}
        className="cover grid min-h-72 gap-8 rounded-[28px] p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-end"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <EventArt type={event.type} draw className="top-1/2 -right-6 w-[min(22rem,50%)] -translate-y-1/2 opacity-35" />
        <div className="grid gap-4">
          <span className="lbl opacity-90">{EVENT_TYPE_LABELS[event.type]}</span>
          <h1 className="font-display max-w-[14ch] text-5xl sm:text-6xl lg:text-7xl">{event.name}</h1>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.9375rem]">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" aria-hidden />{formatEventDate(event.eventDate)}</span>
            {event.location && <span className="inline-flex items-center gap-2"><MapPin className="size-4" aria-hidden />{event.location}</span>}
            <span className="inline-flex items-center gap-2"><Shield className="size-4" aria-hidden />You are {ROLE_LABEL[role]}</span>
          </p>
        </div>
        <div className="flex items-baseline gap-3 md:grid md:justify-items-end md:gap-1">
          <span className="font-display text-7xl leading-[.8] tabular-nums sm:text-8xl lg:text-9xl">{d > 0 ? d : d === 0 ? "Today" : Math.abs(d)}</span>
          <span className="lbl opacity-90">{d > 0 ? (d === 1 ? "day to go" : "days to go") : d === 0 ? "it happens now" : "days ago"}</span>
        </div>
      </header>
      {children}
    </div>
  );
}
