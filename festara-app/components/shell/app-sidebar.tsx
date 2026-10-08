"use client";

import {
  CalendarRange, ChevronsUpDown, ClipboardList, LayoutDashboard, LogOut, Plus, Settings, UserRound, Users, Wallet, CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/actions/auth";
import type { CoverColor } from "@/lib/constants";
import { can, type Role } from "@/lib/permissions";
import { initials } from "@/lib/text";

export interface ShellEvent { id: string; name: string; coverColor: CoverColor; role: Role }
export interface ShellUser { name: string; email: string }

const PLANNED = [
  { label: "Guests", Icon: CalendarDays },
  { label: "Budget", Icon: Wallet },
  { label: "Tasks", Icon: ClipboardList },
] as const;

function CoverDot({ color }: { color: CoverColor }) {
  return <span aria-hidden className="size-4 shrink-0 rounded-[5px]" style={{ background: `var(--event-${color})` }} />;
}

export function AppSidebar({ user, events }: { user: ShellUser; events: ShellEvent[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const eventId = /^\/events\/([^/]+)/.exec(pathname)?.[1];
  const current = eventId && eventId !== "new" ? events.find((e) => e.id === eventId) : undefined;
  const close = () => setOpenMobile(false);

  const eventNav = current
    ? [
        { href: `/events/${current.id}`, label: "Overview", Icon: LayoutDashboard, show: true, exact: true },
        { href: `/events/${current.id}/members`, label: "Members", Icon: Users, show: can(current.role, "event.viewFull"), exact: false },
        { href: `/events/${current.id}/settings`, label: "Settings", Icon: Settings, show: can(current.role, "event.edit"), exact: false },
      ].filter((i) => i.show)
    : [];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Your events" className="data-[slot=sidebar-menu-button]:!h-12">
              <Link href="/events" onClick={close} aria-label="Festara, your events">
                <span className="hidden group-data-[collapsible=icon]:block"><Star className="size-6!" /></span>
                <span className="group-data-[collapsible=icon]:hidden"><Wordmark className="h-6! w-auto!" /></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={current?.name ?? "Switch event"} className="border bg-card data-[state=open]:bg-card">
                  {current ? <CoverDot color={current.coverColor} /> : <CalendarRange className="size-4" aria-hidden />}
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">{current?.name ?? "All events"}</span>
                    <span className="truncate text-xs text-muted-foreground">{current ? "Switch event" : "Pick an event"}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side={isMobile ? "bottom" : "right"} className="w-60">
                <DropdownMenuLabel className="lbl text-muted-foreground">Your events</DropdownMenuLabel>
                {events.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">No events yet.</div>}
                {events.map((e) => (
                  <DropdownMenuItem key={e.id} asChild>
                    <Link href={`/events/${e.id}`} onClick={close} className="gap-2"><CoverDot color={e.coverColor} />{e.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/events/new" onClick={close} className="gap-2"><Plus className="size-4" aria-hidden />New event</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Events" isActive={pathname === "/events" || pathname === "/events/new"}>
                  <Link href="/events" onClick={close}><CalendarRange aria-hidden />Events</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {eventNav.map(({ href, label, Icon, exact }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild tooltip={label} isActive={exact ? pathname === href : pathname.startsWith(href)}>
                    <Link href={href} onClick={close}><Icon aria-hidden />{label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming next</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PLANNED.map(({ label, Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton tooltip={`${label}: planned`} aria-disabled className="cursor-default text-muted-foreground hover:bg-transparent hover:text-muted-foreground">
                    <Icon aria-hidden />{label}
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="text-[0.6875rem] font-semibold uppercase tracking-wide">Planned</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user.name} className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-card text-xs font-semibold">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" aria-hidden />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side={isMobile ? "top" : "right"} className="w-60">
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">Theme<ThemeToggle /></div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" onClick={close} className="gap-2"><UserRound className="size-4" aria-hidden />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action={signOutAction}>
                    <button type="submit" className="flex w-full items-center gap-2 text-left"><LogOut className="size-4" aria-hidden />Sign out</button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
