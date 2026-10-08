import { Link2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { EventCard, type CardEvent } from "@/components/event-card";
import { RoleBadge } from "@/components/role-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/permissions";

const HERO_EVENTS: CardEvent[] = [
  { name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore", coverColor: "mehndi", role: "admin", memberCount: 18 },
  { name: "Naran Trip", type: "trip", eventDate: "2027-06-20", location: "Naran, Khyber Pakhtunkhwa", coverColor: "sky", role: "member", memberCount: 9 },
  { name: "Spring Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "Main Hall, Multan", coverColor: "night", role: "admin", memberCount: 14 },
];

const ROLE_COPY: { role: Role; line: string }[] = [
  { role: "admin", line: "Edits the event, sends invites, decides who is in and what they can do." },
  { role: "member", line: "Sees the full plan and helps with it. Cannot change the event or who is in it." },
  { role: "guest", line: "Sees the basics, such as the date and place, and nothing more." },
];

export function Landing() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" aria-label="Festara home"><Wordmark className="h-7 w-auto" /></Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost"><Link href="/login">Sign in</Link></Button>
          <Button asChild><Link href="/register">Create account</Link></Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-16 lg:pb-28">
          <div className="grid gap-6">
            <h1 className="rise font-display text-balance text-[2.5rem] leading-[1.05] sm:text-6xl" style={{ "--d": "0ms" } as React.CSSProperties}>
              A calm place for people planning something together.
            </h1>
            <p className="rise max-w-[52ch] text-pretty text-lg text-muted-foreground" style={{ "--d": "80ms" } as React.CSSProperties}>
              Weddings, trips and society events. Create the event, send one link to everyone involved, and decide who can see and change what.
            </p>
            <div className="rise flex flex-wrap items-center gap-3" style={{ "--d": "160ms" } as React.CSSProperties}>
              <Button asChild size="lg"><Link href="/register">Create your first event</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/login">Sign in</Link></Button>
            </div>
          </div>
          <div className="rise grid gap-4 sm:grid-cols-2 lg:grid-cols-1" style={{ "--d": "240ms" } as React.CSSProperties} aria-hidden>
            {HERO_EVENTS.slice(0, 2).map((e) => <EventCard key={e.name} event={e} />)}
            <div className="sm:col-span-2 lg:col-span-1"><EventCard event={HERO_EVENTS[2]} /></div>
          </div>
        </section>

        <section aria-labelledby="how" className="border-y bg-secondary">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6">
            <h2 id="how" className="font-display text-balance text-3xl sm:text-4xl">Three steps from idea to everyone on board.</h2>
            <ol className="grid gap-4 md:grid-cols-3">
              <li className="grid content-start gap-3 rounded-xl border bg-card p-6">
                <Sparkles className="size-5" aria-hidden />
                <h3 className="text-lg font-semibold">Create the event</h3>
                <p className="text-muted-foreground">Name it, set the date and place, pick a cover color. You become its Admin.</p>
              </li>
              <li className="grid content-start gap-3 rounded-xl border bg-card p-6">
                <Link2 className="size-5" aria-hidden />
                <h3 className="text-lg font-semibold">Share one link</h3>
                <p className="text-muted-foreground">Send the invite link on WhatsApp. It works for seven days and shows the event before anyone has to sign up.</p>
              </li>
              <li className="grid content-start gap-3 rounded-xl border bg-card p-6">
                <ShieldCheck className="size-5" aria-hidden />
                <h3 className="text-lg font-semibold">Set each person&rsquo;s role</h3>
                <p className="text-muted-foreground">Promote a helper, keep a guest to the basics. Every event always keeps at least one Admin.</p>
              </li>
            </ol>
          </div>
        </section>

        <section aria-labelledby="roles" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid content-start gap-3">
            <h2 id="roles" className="font-display text-balance text-3xl sm:text-4xl">The right access for every person.</h2>
            <p className="max-w-[48ch] text-muted-foreground">
              A family event and a society fest need different rules. Roles are checked on the server, not only hidden in the interface.
            </p>
          </div>
          <ul className="grid gap-3">
            {ROLE_COPY.map(({ role, line }) => (
              <li key={role} className="flex items-start gap-4 rounded-xl border bg-card p-5">
                <RoleBadge role={role} className="mt-0.5" />
                <p>{line}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-6 rounded-xl border bg-card p-8 sm:p-12">
            <h2 className="font-display text-balance text-3xl sm:text-4xl">Start with the event you are planning now.</h2>
            <div><Button asChild size="lg"><Link href="/register">Create your first event</Link></Button></div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <Wordmark className="h-5 w-auto" />
          <span>A final year project. Plan together.</span>
        </div>
      </footer>
    </div>
  );
}
