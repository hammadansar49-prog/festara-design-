"use client";

import { CalendarRange, LayoutDashboard, Settings, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ShellEvent } from "@/components/shell/app-sidebar";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/** Phone navigation (md and below). Desktop keeps the sidebar. Tabs follow the role, like the sidebar does. */
export function BottomTabs({ events }: { events: ShellEvent[] }) {
  const pathname = usePathname();
  const id = /^\/events\/([^/]+)/.exec(pathname)?.[1];
  const current = id && id !== "new" ? events.find((e) => e.id === id) : undefined;

  const tabs = [
    { href: "/events", label: "Events", Icon: CalendarRange, show: true, on: pathname === "/events" || pathname === "/events/new" },
    ...(current
      ? [
          { href: `/events/${current.id}`, label: "Home", Icon: LayoutDashboard, show: true, on: pathname === `/events/${current.id}` },
          { href: `/events/${current.id}/members`, label: "Members", Icon: Users, show: can(current.role, "event.viewFull"), on: pathname.startsWith(`/events/${current.id}/members`) },
          { href: `/events/${current.id}/settings`, label: "Settings", Icon: Settings, show: can(current.role, "event.edit"), on: pathname.startsWith(`/events/${current.id}/settings`) },
        ]
      : []),
    { href: "/profile", label: "Profile", Icon: UserRound, show: true, on: pathname === "/profile" },
  ].filter((t) => t.show);

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, Icon, on }) => (
          <li key={href} className="flex-1">
            <Link href={href} aria-current={on ? "page" : undefined}
              className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors", on ? "text-foreground" : "text-muted-foreground")}>
              <Icon className="size-5" aria-hidden />
              {label}
              <span aria-hidden className={cn("h-0.5 w-5 rounded-full transition-colors", on ? "bg-foreground" : "bg-transparent")} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
