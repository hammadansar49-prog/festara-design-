"use client";

import { CalendarRange, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import type { ShellEvent } from "@/components/shell/app-sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SECTION: Record<string, string> = { members: "Members", settings: "Settings" };

function useCrumbs(events: ShellEvent[]) {
  const pathname = usePathname();
  const [, area, id, section] = pathname.split("/");
  const crumbs: { label: string; href?: string }[] = [];
  if (area === "profile") return [{ label: "Profile" }];
  crumbs.push({ label: "Events", href: id ? "/events" : undefined });
  if (id === "new") crumbs.push({ label: "New event" });
  else if (id) {
    const name = events.find((e) => e.id === id)?.name ?? "Event";
    crumbs.push({ label: name, href: section ? `/events/${id}` : undefined });
    if (section) crumbs.push({ label: SECTION[section] ?? section });
  }
  return crumbs;
}

export function SiteHeader({ events }: { events: ShellEvent[] }) {
  const crumbs = useCrumbs(events);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => (
            <Fragment key={c.label + i}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {c.href ? (
                  <BreadcrumbLink asChild><Link href={c.href} className="truncate">{c.label}</Link></BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="ml-auto gap-2 text-muted-foreground" aria-label="Search and jump to">
        <Search className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">Jump to…</span>
        <kbd className="hidden rounded-sm border bg-secondary px-1.5 font-sans text-[0.6875rem] font-semibold sm:inline">Ctrl K</kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Jump to" description="Search events and pages">
        <Command>
        <CommandInput placeholder="Search events and pages" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Events">
            {events.map((e) => (
              <CommandItem key={e.id} value={e.name} onSelect={() => go(`/events/${e.id}`)}>
                <span aria-hidden className="size-3.5 rounded-[4px]" style={{ background: `var(--event-${e.coverColor})` }} />
                {e.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Go to">
            <CommandItem value="all events" onSelect={() => go("/events")}><CalendarRange aria-hidden />All events</CommandItem>
            <CommandItem value="new event create" onSelect={() => go("/events/new")}><Plus aria-hidden />New event</CommandItem>
            <CommandItem value="profile account" onSelect={() => go("/profile")}><UserRound aria-hidden />Profile</CommandItem>
          </CommandGroup>
        </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
