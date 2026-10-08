import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { HeroStage } from "@/components/landing/hero-stage";
import { LandingMotion } from "@/components/landing/motion";
import { Occasions } from "@/components/landing/occasions";
import { PermissionMatrix } from "@/components/landing/permission-matrix";
import { PanelCreate, PanelRoles, PanelShare, STEPS } from "@/components/landing/story-panels";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#occasions", label: "Occasions" },
  { href: "#access", label: "Access" },
];

/** One container and one section rhythm for the whole page. */
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const SECTION = "scroll-mt-28 py-24 lg:py-32";

function SectionHead({ id, label, title, tone = "text-muted-foreground", children }: { id: string; label: string; title: string; tone?: string; children?: ReactNode }) {
  return (
    <div className="grid gap-4">
      <p data-reveal className={`lbl ${tone}`}>{label}</p>
      <h2 id={id} data-reveal className="font-display max-w-[18ch] text-balance text-4xl sm:text-5xl">{title}</h2>
      {children}
    </div>
  );
}

export function Landing() {
  const panels = [<PanelCreate key="c" />, <PanelShare key="s" />, <PanelRoles key="r" />];
  return (
    <div data-landing className="min-h-dvh overflow-x-clip">
      <LandingMotion />

      <header className={`sticky top-4 z-50 mt-4 ${WRAP}`}>
        <div className="flex items-center justify-between rounded-full border bg-card/95 py-2 pr-2 pl-5 shadow-[var(--shadow-overlay)] backdrop-blur">
          <Link href="/" aria-label="Festara home"><Wordmark className="h-5 w-auto" /></Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="rounded-full"><Link href="/register">Create event</Link></Button>
          </div>
        </div>
      </header>

      <main>
        {/* hook */}
        <section className={`${WRAP} grid grid-cols-1 gap-14 pt-16 pb-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-20 lg:pt-24 lg:pb-32`}>
          <div className="grid justify-items-start gap-7">
            <p data-hero className="lbl text-muted-foreground">Event planning for groups</p>
            <h1 data-hero className="font-display text-balance text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
              One link. Everyone planning together.
            </h1>
            <p data-hero className="max-w-[46ch] text-pretty text-lg text-muted-foreground">
              Festara is where weddings, trips and society events get planned. Send one invite, and every person sees exactly what they should.
            </p>
            <div data-hero className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg"><Link href="/register">Create your event</Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#how">See how it works</a></Button>
            </div>
            <p data-hero className="text-sm text-muted-foreground">Opens in the browser on any phone. Nothing to install.</p>
          </div>
          <HeroStage />
        </section>

        {/* problem */}
        <section className="border-y bg-secondary">
          <div className={`${WRAP} py-24 lg:py-32`}>
            <p data-reveal className="font-display max-w-[22ch] text-balance text-4xl sm:text-5xl">
              The plan lives in six chats and one cousin&rsquo;s memory.
            </p>
          </div>
        </section>

        {/* how it works: three steps, each with the screen it produces */}
        <section id="how" aria-labelledby="how-h" className={`${WRAP} ${SECTION} grid gap-16`}>
          <SectionHead id="how-h" label="How it works" title="From idea to everyone on board." />
          <ol className="grid gap-16 lg:gap-20">
            {STEPS.map((s, i) => (
              <li key={s.n} data-reveal className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-16">
                <div className="grid gap-2">
                  <span className="lbl text-muted-foreground">{s.n}</span>
                  <h3 className="text-2xl font-semibold">{s.title}</h3>
                  <p className="max-w-[40ch] text-muted-foreground">{s.body}</p>
                </div>
                <div className="rounded-[24px] bg-secondary p-4 sm:p-8">{panels[i]}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* occasions */}
        <section id="occasions" aria-labelledby="occ-h" className="scroll-mt-28" style={{ background: "var(--event-night)", color: "var(--event-night-fg)" }}>
          <div className={`${WRAP} py-24 lg:py-32 grid gap-16`}>
            <SectionHead id="occ-h" label="Occasions" title="Built for the events we actually have." tone="text-[var(--event-night-fg)]/70" />
            <Occasions />
          </div>
        </section>

        {/* proof */}
        <section id="access" aria-labelledby="acc-h" className={`${WRAP} ${SECTION} grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16`}>
          <SectionHead id="acc-h" label="Access" title="Checked on the server, not just hidden.">
            <p data-reveal className="max-w-[44ch] text-lg text-muted-foreground">
              A guest cannot edit an event by finding the right URL. Every role is enforced where the data lives, and this table is drawn from the same rules.
            </p>
          </SectionHead>
          <div data-reveal className="min-w-0"><PermissionMatrix /></div>
        </section>

        {/* close */}
        <section aria-labelledby="end-h" style={{ background: "var(--event-mehndi)", color: "var(--event-mehndi-fg)" }}>
          <div className={`${WRAP} grid justify-items-start gap-7 py-24 lg:py-32`}>
            <h2 id="end-h" data-reveal className="font-display max-w-[14ch] text-balance text-5xl leading-[1.02] sm:text-6xl">Your next event starts with one link.</h2>
            <p data-reveal className="max-w-[40ch] text-lg opacity-90">Create the event and share the link. Everyone else just taps it.</p>
            <div data-reveal>
              <Button asChild size="lg" className="bg-[var(--event-mehndi-fg)] text-[var(--event-mehndi)] hover:bg-[var(--event-mehndi-fg)]/90 focus-visible:ring-[var(--event-mehndi-fg)]/70">
                <Link href="/register">Create your event</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted-foreground`}>
          <Wordmark className="h-5 w-auto" />
          <nav aria-label="Account" className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Create account</Link>
          </nav>
          <span className="flex items-center gap-3">A final year project. Plan together.<ThemeToggle /></span>
        </div>
      </footer>
    </div>
  );
}
