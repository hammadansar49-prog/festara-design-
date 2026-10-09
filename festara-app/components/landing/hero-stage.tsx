"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { EventArt } from "@/components/brand/event-art";

const JOINS = [
  { name: "Tariq joined", note: "as Guest, just now" },
  { name: "Sana joined", note: "as Member, 2 min ago" },
  { name: "Hamza made a link", note: "Member link, 7 days" },
  { name: "Khala Shazia joined", note: "as Guest, just now" },
  { name: "Areeba joined", note: "as Member, just now" },
];

/**
 * The hero visual: an invite in the event's own cover colour. People keep joining it, one toast after another.
 * Made from the product's own parts, no photos.
 */
export function HeroStage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => { if (!document.hidden) setTick((t) => t + 1); }, 2600);
    return () => clearInterval(id);
  }, []);
  const visible = [0, 1].map((i) => JOINS[(tick + i) % JOINS.length]).reverse();

  return (
    <div
      data-stage
      role="img"
      aria-label="An invite to Hira and Bilal's mehndi in its green cover colour. People keep joining it: Tariq as a Guest, Sana as a Member."
      data-cover="mehndi"
      className="cover relative mx-auto flex min-h-[34rem] w-full max-w-md flex-col justify-between gap-8 rounded-[28px] p-7 shadow-[0_60px_100px_-50px_color-mix(in_srgb,var(--event-mehndi)_80%,transparent)] sm:p-8 lg:max-w-none"
      style={{ background: "var(--event-mehndi)", color: "var(--event-mehndi-fg)" }}
    >
      <EventArt type="mehndi" draw className="-right-10 top-16 w-72 opacity-30" />
      <div aria-hidden className="grid gap-3">
        <span className="lbl opacity-85">You&rsquo;re invited</span>
        <p className="font-display max-w-[9ch] text-5xl sm:text-6xl">Hira &amp; Bilal&rsquo;s Mehndi</p>
        <p className="grid gap-0.5 text-[0.9375rem] opacity-90">
          <span>Thursday, 12 November</span>
          <span>Garden Lawn, Multan</span>
        </p>
      </div>

      <div aria-hidden className="grid justify-items-end gap-3">
        {visible.map((j) => (
          <div key={j.name + tick} className="flex animate-in fade-in slide-in-from-bottom-4 items-center gap-3 rounded-full bg-card py-2 pr-4 pl-2 text-sm text-foreground shadow-[var(--shadow-overlay)] duration-500">
            <span className="grid size-8 place-items-center rounded-full bg-ok-tint text-ok"><Check className="size-4" /></span>
            <span className="grid leading-tight">
              <span className="font-semibold">{j.name}</span>
              <span className="text-xs text-muted-foreground">{j.note}</span>
            </span>
          </div>
        ))}
        <div className="grid w-full gap-3 rounded-2xl bg-card p-4 text-foreground shadow-[var(--shadow-overlay)]">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold">SR</span>
            <span className="grid text-sm leading-tight">
              <span className="font-semibold">Sana Rashid</span>
              <span className="text-muted-foreground">Invited as Member</span>
            </span>
          </div>
          <span className="rounded-full bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground">Join the mehndi</span>
        </div>
      </div>
    </div>
  );
}
