"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EventArt } from "@/components/brand/event-art";
import { RoleBadge } from "@/components/role-badge";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { EventSummary } from "@/lib/data/types";
import { formatEventDate } from "@/lib/date";

function parts(iso: string, now: number): readonly (readonly [number, string])[] {
  const ms = Math.max(0, new Date(`${iso}T00:00:00`).getTime() - now);
  return [
    [Math.floor(ms / 864e5), "Days"], [Math.floor(ms / 36e5) % 24, "Hours"],
    [Math.floor(ms / 6e4) % 60, "Min"], [Math.floor(ms / 1e3) % 60, "Sec"],
  ];
}

/** The nearest event as a spotlight, with a countdown that ticks every second. */
export function NextUp({ event }: { event: EventSummary }) {
  const [now, setNow] = useState(0); // 0 until mounted, so server and client markup match
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  const t = now ? parts(event.eventDate, now) : ([["–", "Days"], ["–", "Hours"], ["–", "Min"], ["–", "Sec"]] as const);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid overflow-hidden rounded-[28px] border bg-card transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_50px_80px_-50px_rgb(0_0_0/.8)] lg:grid-cols-[1.3fr_1fr]"
    >
      <div
        data-cover={event.coverColor}
        className="cover flex min-h-72 flex-col justify-between gap-6 p-6 sm:p-9"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <EventArt type={event.type} draw className="-right-8 -bottom-10 w-[min(20rem,55%)] opacity-40 transition-transform duration-700 group-hover:scale-110" />
        <span className="lbl opacity-90">Next up &middot; {EVENT_TYPE_LABELS[event.type]}</span>
        <div className="grid justify-items-start gap-4">
          <h2 className="font-display max-w-[12ch] text-5xl sm:text-6xl">{event.name}</h2>
          <RoleBadge role={event.role} />
        </div>
      </div>
      <div className="grid content-between gap-6 p-6 sm:p-9">
        <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Time until the event">
          {t.map(([n, label]) => (
            <div key={label} className="rounded-xl bg-secondary px-1 py-3 text-center">
              <b className="font-display block text-3xl tabular-nums sm:text-4xl">{n}</b>
              <small className="lbl text-[0.65rem] text-muted-foreground">{label}</small>
            </div>
          ))}
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2.5"><CalendarDays className="size-4" aria-hidden />{formatEventDate(event.eventDate)}</span>
          {event.location && <span className="flex items-center gap-2.5"><MapPin className="size-4" aria-hidden />{event.location}</span>}
          <span className="flex items-center gap-2.5"><Users className="size-4" aria-hidden />{event.memberCount} {event.memberCount === 1 ? "person" : "people"} in</span>
        </div>
        <span className="inline-flex h-11 w-fit items-center rounded-full border border-input px-5 text-sm font-semibold group-hover:bg-secondary">Open the event &rarr;</span>
      </div>
    </Link>
  );
}
