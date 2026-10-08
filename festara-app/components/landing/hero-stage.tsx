import { Check } from "lucide-react";

/**
 * The hero visual: an invite in the event's own cover color, the join card a relative sees,
 * and the moment someone joins. Made from the product's parts, no photos.
 */
export function HeroStage() {
  return (
    <div
      data-hero
      role="img"
      aria-label="An invite to Hira and Bilal's mehndi in its green cover color. Tariq has just joined as a Guest, and Sana is about to join as a Member."
      className="mx-auto flex aspect-[4/5] w-full max-w-md flex-col justify-between gap-8 rounded-[24px] p-6 sm:p-8 lg:max-w-none"
      style={{ background: "var(--event-mehndi)", color: "var(--event-mehndi-fg)" }}
    >
      <div aria-hidden className="grid gap-3">
        <span className="lbl opacity-85">You&rsquo;re invited</span>
        <p className="font-display max-w-[10ch] text-4xl leading-[1.05] sm:text-[2.75rem]">Hira &amp; Bilal&rsquo;s Mehndi</p>
        <p className="grid gap-0.5 text-[0.9375rem] opacity-90">
          <span>Thursday, 12 November</span>
          <span>Garden Lawn, Multan</span>
        </p>
      </div>

      <div aria-hidden className="grid justify-items-end gap-3">
        <div data-float className="flex items-center gap-3 rounded-full bg-card py-2 pr-4 pl-2 text-sm shadow-[var(--shadow-overlay)]">
          <span className="grid size-7 place-items-center rounded-full bg-ok-tint text-ok"><Check className="size-4" /></span>
          <span className="grid leading-tight">
            <span className="font-medium text-foreground">Tariq joined</span>
            <span className="text-xs text-muted-foreground">as Guest, just now</span>
          </span>
        </div>
        <div data-float className="grid w-full gap-3 rounded-xl bg-card p-4 text-foreground shadow-[var(--shadow-overlay)]">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold">SR</span>
            <span className="grid text-sm leading-tight">
              <span className="font-medium">Sana Rashid</span>
              <span className="text-muted-foreground">Invited as Member</span>
            </span>
          </div>
          <span className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Join the mehndi</span>
        </div>
      </div>
    </div>
  );
}
