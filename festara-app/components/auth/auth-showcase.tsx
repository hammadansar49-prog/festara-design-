"use client";

import { useEffect, useState } from "react";
import { EventArt } from "@/components/brand/event-art";
import { EventCard, type CardEvent } from "@/components/event-card";

const SAMPLES: { headline: string; event: CardEvent }[] = [
  { headline: "One link, the whole family.", event: { name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore", coverColor: "mehndi", role: "admin", memberCount: 4 } },
  { headline: "Friends who actually commit.", event: { name: "Naran Trip", type: "trip", eventDate: "2027-06-20", location: "Naran, Khyber Pakhtunkhwa", coverColor: "sky", role: "member", memberCount: 6 } },
  { headline: "Hand over by changing roles.", event: { name: "Spring Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "Main Hall, Multan", coverColor: "night", role: "admin", memberCount: 14 } },
];

/** The side panel on sign-in screens. It cycles through event covers, each in its own colour and line art. */
export function AuthShowcase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => { if (!document.hidden) setI((n) => (n + 1) % SAMPLES.length); }, 4200);
    return () => clearInterval(id);
  }, []);
  const { headline, event } = SAMPLES[i];

  return (
    <aside
      aria-hidden data-cover={event.coverColor}
      className="cover m-4 hidden flex-col justify-start gap-8 rounded-[28px] p-10 transition-[background-color] duration-700 lg:flex xl:p-14"
      style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
    >
      <EventArt key={`art-${event.name}`} type={event.type} draw className="-top-8 -right-10 w-[min(28rem,70%)] opacity-25" />
      <span className="lbl opacity-90">Your events live here</span>
      <p key={headline} className="font-display max-w-[10ch] animate-in fade-in slide-in-from-bottom-3 text-6xl duration-700 xl:text-7xl">{headline}</p>
      <div key={`card-${event.name}`} className="mt-auto flex animate-in fade-in slide-in-from-bottom-6 justify-end duration-700">
        <div className="w-full max-w-sm -rotate-2 text-foreground"><EventCard event={event} /></div>
      </div>
    </aside>
  );
}
