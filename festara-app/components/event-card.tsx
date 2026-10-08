import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/role-badge";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { EventSummary } from "@/lib/data/types";
import { formatEventDate } from "@/lib/date";

export type CardEvent = Pick<EventSummary, "name" | "type" | "eventDate" | "location" | "coverColor" | "role" | "memberCount">;

export function EventCard({ event, href }: { event: CardEvent; href?: string }) {
  const card = (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <div
        className="flex min-h-32 flex-col justify-end gap-1.5 p-5"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <span className="lbl opacity-85">{EVENT_TYPE_LABELS[event.type]}</span>
        <h2 className="font-display text-[1.75rem]">{event.name}</h2>
      </div>
      <div className="grid gap-2 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span>{formatEventDate(event.eventDate)}</span>
          <RoleBadge role={event.role} className="ml-auto" />
        </div>
        {event.location && (
          <div className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden />{event.location}</div>
        )}
        <div className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden />
          {event.memberCount} {event.memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </article>
  );
  return href ? (
    <Link href={href} className="block rounded-lg transition-transform active:scale-[0.98]">{card}</Link>
  ) : card;
}
