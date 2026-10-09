import Link from "next/link";
import { EventArt } from "@/components/brand/event-art";
import { Star, Wordmark } from "@/components/brand/wordmark";
import { HeroStage } from "@/components/landing/hero-stage";
import { LandingMotion } from "@/components/landing/motion";
import { Marquee } from "@/components/landing/marquee";
import { MobileMenu } from "@/components/landing/mobile-menu";
import { Occasions } from "@/components/landing/occasions";
import { PermissionMatrix } from "@/components/landing/permission-matrix";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import { STEPS } from "@/components/landing/steps";
import { PanelCreate, PanelRoles, PanelShare } from "@/components/landing/story-panels";
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

function SectionHead({ id, label, children, extra }: { id: string; label: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="grid gap-4">
      <p data-reveal className="lbl text-muted-foreground">{label}</p>
      <h2 id={id} data-reveal className="font-display max-w-[14ch] text-balance text-5xl sm:text-6xl lg:text-7xl">{children}</h2>
      {extra}
    </div>
  );
}

export function Landing() {
  const panels = [<PanelCreate key="c" />, <PanelShare key="s" />, <PanelRoles key="r" />];
  const problem = ["The", "plan", "lives", "in", "six", "chats", "and"];
  const problemAccent = ["one", "cousin’s", "memory."];

  return (
    <div data-landing className="relative min-h-dvh overflow-x-clip">
      <LandingMotion />
      <SmoothScroll />
      <div aria-hidden className="glow" />

      <header className={`fixed top-4 left-1/2 z-50 w-[min(1152px,calc(100%-1.5rem))] -translate-x-1/2`}>
        <div className="flex items-center justify-between rounded-full border bg-card/85 py-2 pr-2 pl-5 shadow-[var(--shadow-overlay)] backdrop-blur-md">
          <Link href="/" aria-label="Festara home" className="flex items-center gap-2"><Star className="size-6" /><Wordmark className="h-5 w-auto" /></Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{n.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/login">Sign in</Link></Button>
            <Button asChild size="sm"><Link href="/register">Create event</Link></Button>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* hook */}
        <section data-hero-section className={`${WRAP} grid grid-cols-1 gap-14 pt-36 pb-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-20 lg:pt-44`}>
          <div className="grid justify-items-start gap-7">
            <p data-hero className="lbl text-muted-foreground">Event planning for groups</p>
            <h1 className="hero-title font-display text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.88] tracking-[-0.055em]" aria-label="One link. Everyone planning together.">
              <span className="ln"><span>One link.</span></span>
              <span className="ln"><span className="accent">Everyone</span></span>
              <span className="ln"><span>planning</span></span>
              <span className="ln"><span>together.</span></span>
            </h1>
            <p data-hero className="max-w-[44ch] text-pretty text-lg text-muted-foreground sm:text-xl">
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

        <Marquee />

        {/* problem */}
        <section className="py-28 lg:py-44">
          <div className={WRAP}>
            <p className="problem-text font-display max-w-[16ch] text-balance text-5xl leading-none sm:text-7xl lg:text-8xl">
              {problem.map((w, i) => <span key={i} className="w">{w} </span>)}
              {problemAccent.map((w, i) => <span key={i} className="w accent">{w} </span>)}
            </p>
          </div>
        </section>

        {/* how it works: three steps, each with the screen it produces */}
        <section id="how" aria-labelledby="how-h" className={`${WRAP} ${SECTION} grid gap-16 !pt-0`}>
          <SectionHead id="how-h" label="How it works">From idea to <span className="accent">everyone</span> on board.</SectionHead>
          <ol className="grid gap-8">
            {STEPS.map((s, i) => (
              <li
                key={s.n} className="stack-card grid grid-cols-1 items-center gap-8 rounded-[28px] border bg-card p-6 shadow-[0_-30px_60px_-40px_rgb(0_0_0/.5)] sm:p-10 md:grid-cols-[.9fr_1.1fr] md:gap-14 md:min-h-[30rem]"
                style={{ top: `${6.5 + i * 1.25}rem` }}
              >
                <div className="grid gap-3">
                  <span className="font-display text-8xl leading-[.8] text-transparent [-webkit-text-stroke:1.5px_var(--line-strong)]" aria-hidden>{s.n}</span>
                  <h3 className="font-display mt-4 text-4xl sm:text-5xl"><span className="sr-only">{s.n}. </span>{s.title}</h3>
                  <p className="max-w-[36ch] text-lg text-muted-foreground">{s.body}</p>
                </div>
                <div className="min-w-0">{panels[i]}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* occasions */}
        <section id="occasions" aria-labelledby="occ-h" className={`${WRAP} ${SECTION} grid gap-14 !pt-0`}>
          <SectionHead id="occ-h" label="Occasions">Built for the events we <span className="accent">actually</span> have.</SectionHead>
          <Occasions />
        </section>

        {/* proof */}
        <section id="access" aria-labelledby="acc-h" className={`${WRAP} ${SECTION} grid grid-cols-1 gap-12 !pt-0 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16`}>
          <SectionHead
            id="acc-h" label="Access"
            extra={<p data-reveal className="max-w-[44ch] text-lg text-muted-foreground">A guest cannot edit an event by finding the right URL. Every role is enforced where the data lives, and this table is drawn from the same rules.</p>}
          >
            Checked on the server, <span className="accent">not just hidden.</span>
          </SectionHead>
          <div data-reveal className="min-w-0"><PermissionMatrix /></div>
        </section>

        {/* close */}
        <section data-close data-cover="mehndi" aria-labelledby="end-h" className="cover relative mx-3 rounded-[28px] sm:mx-6" style={{ background: "var(--event-mehndi)", color: "var(--event-mehndi-fg)" }}>
          <EventArt type="mehndi" className="-right-20 top-1/2 w-[34rem] -translate-y-1/2 opacity-20" />
          <div className={`${WRAP} grid justify-items-start gap-7 py-24 lg:py-36`}>
            <h2 id="end-h" data-reveal className="font-display max-w-[11ch] text-balance text-6xl sm:text-8xl">Your next event starts with <span className="accent !text-current">one link.</span></h2>
            <p data-reveal className="max-w-[40ch] text-lg opacity-90">Create the event and share the link. Everyone else just taps it.</p>
            <div data-reveal>
              <Button asChild size="lg" className="bg-[var(--event-mehndi-fg)] text-[var(--event-mehndi)] hover:bg-[var(--event-mehndi-fg)]">
                <Link href="/register">Create your event</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10">
        <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-10 text-sm text-muted-foreground`}>
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
