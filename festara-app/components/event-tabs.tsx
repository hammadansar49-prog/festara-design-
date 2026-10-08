"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventTabs({ eventId, showMembers, showSettings }: { eventId: string; showMembers: boolean; showSettings: boolean }) {
  const pathname = usePathname();
  const base = `/events/${eventId}`;
  const tabs = [
    { href: base, label: "Overview" },
    ...(showMembers ? [{ href: `${base}/members`, label: "Members" }] : []),
    ...(showSettings ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];
  return (
    <nav aria-label="Event sections" className="flex gap-6 border-b">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-sm font-medium ${active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
