import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { EventArt } from "@/components/brand/event-art";
import { RoleBadge } from "@/components/role-badge";
import { Tilt } from "@/components/tilt";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { EventSummary } from "@/lib/data/types";
import { daysUntil, formatEventDate } from "@/lib/date";

export type CardEvent = Pick<EventSummary, "name" | "type" | "eventDate" | "location" | "coverColor" | "role" | "memberCount">;

function Countdown({ iso }: { iso: string }) {
  const d = daysUntil(iso);
  return (
    <span className="rounded-full bg-black/25 px-3 py-1 text-sm font-bold tabular-nums backdrop-blur-sm" data-cover-chip>
      {d > 0 ? `${d} ${d === 1 ? "day" : "days"}` : d === 0 ? "Today" : "Done"}
    </span>
  );
}

export function EventCard({ event, href }: { event: CardEvent; href?: string }) {
  const card = (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border bg-card shadow-sm transition-shadow duration-500 group-hover/card:shadow-[0_40px_60px_-40px_rgb(0_0_0/.7)]">
      <div
        data-cover={event.coverColor}
        className="cover flex min-h-52 flex-col justify-between gap-4 p-6"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <EventArt type={event.type} className="-right-4 -bottom-6 w-3/5 max-w-60 transition-transform duration-700 group-hover/card:scale-110 group-hover/card:-rotate-3" />
        <div className="flex items-center justify-between gap-3">
          <span className="lbl opacity-90">{EVENT_TYPE_LABELS[event.type]}</span>
          <Countdown iso={event.eventDate} />
        </div>
        <h2 className="font-display text-[2rem] sm:text-4xl">{event.name}</h2>
      </div>
      <div className="grid gap-2.5 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span>{formatEventDate(event.eventDate)}</span>
          <RoleBadge role={event.role} className="ml-auto" />
        </div>
        {event.location && (
          <div className="flex items-center gap-2.5"><MapPin className="size-4 shrink-0" aria-hidden />{event.location}</div>
        )}
        <div className="flex items-center gap-2.5">
          <Users className="size-4 shrink-0" aria-hidden />
          {event.memberCount} {event.memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </article>
  );
  return href ? (
    <Tilt className="group/card h-full"><Link href={href} className="block h-full rounded-[24px]">{card}</Link></Tilt>
  ) : (
    <div className="group/card h-full">{card}</div>
  );
}
