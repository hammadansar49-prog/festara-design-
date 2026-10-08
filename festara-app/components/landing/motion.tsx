"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/**
 * Three quiet motions, each played once. Scrolling itself is never changed (no smooth scroll, no pinning, no scrubbing).
 * - data-hero / data-float: the hero copy rises, then the "joined" toast and the join card land
 * - data-reveal: sections fade up as they enter
 * - data-meter: the sample budget meter fills to 82%, then its warning appears
 * People who ask for less motion get the finished page straight away.
 */
export function LandingMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add({ calm: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      if (ctx.conditions?.calm) {
        gsap.set("[data-hero],[data-reveal],[data-float]", { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
        .to("[data-hero]", { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0)
        .to("[data-float]", { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.25 }, 0.6);

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }),
      });

      gsap.utils.toArray<HTMLElement>("[data-meter]").forEach((bar) => {
        const note = bar.closest("div.grid")?.querySelector("[data-meter-note]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: bar, start: "top 85%", once: true } })
          .fromTo(bar, { scaleX: 0 }, { scaleX: 0.82, duration: 0.9, ease: "power2.out" });
        if (note) tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.25 }, "-=0.15");
      });
    });

    return () => mm.revert();
  }, []);

  return null;
}
