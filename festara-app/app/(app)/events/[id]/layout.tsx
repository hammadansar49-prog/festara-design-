import { CalendarDays, MapPin, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { getEventCached } from "@/lib/data/queries";
import { formatEventDate } from "@/lib/date";

const ROLE_LABEL = { admin: "Admin", member: "Member", guest: "Guest" } as const;

export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role } = result.data;

  return (
    <div className="grid gap-6">
      <header
        className="flex min-h-36 flex-col justify-end gap-2.5 rounded-lg p-6 sm:p-8"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <span className="lbl opacity-85">{EVENT_TYPE_LABELS[event.type]}</span>
        <h1 className="font-display text-4xl sm:text-[2.5rem]">{event.name}</h1>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />{formatEventDate(event.eventDate)}</span>
          {event.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{event.location}</span>}
          <span className="inline-flex items-center gap-1.5"><Shield className="size-4" aria-hidden />You are {ROLE_LABEL[role]}</span>
        </p>
      </header>
      {children}
    </div>
  );
}
