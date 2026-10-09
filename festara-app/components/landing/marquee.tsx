"use client";

import { useEffect, useRef } from "react";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@/lib/constants";

const DOTS = ["mehndi", "marigold", "sindoor", "sky", "kahwa", "night"];

/** A band of every event type that drifts on its own and speeds up with the scroll. Decorative only. */
export function Marquee() {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = row.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, boost = 0, last = window.scrollY, raf = 0;
    const loop = () => {
      const dy = window.scrollY - last; last = window.scrollY;
      boost = boost * 0.92 + Math.max(-14, Math.min(14, dy * 0.35)) * 0.08 * 6;
      x -= 0.7 + Math.abs(boost);
      const half = el.scrollWidth / 2;
      if (-x >= half) x += half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const one = (k: string) => (
    <span key={k}>
      {EVENT_TYPES.map((t, i) => (
        <span key={t} className="inline-flex items-center gap-12">
          {i % 2 ? <em>{EVENT_TYPE_LABELS[t]}</em> : EVENT_TYPE_LABELS[t]}
          <i className="dot" style={{ background: `var(--event-${DOTS[i % DOTS.length]})` }} />
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee" aria-hidden>
      <div ref={row} className="row">{one("a")}{one("b")}</div>
    </div>
  );
}
