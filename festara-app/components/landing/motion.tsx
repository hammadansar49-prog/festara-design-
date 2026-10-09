"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

/**
 * Landing motion (Hammad's design). People who ask for less motion get the finished page at once.
 * - hero: the headline rises line by line, the copy and the invite stage follow, the stage drifts up as you scroll
 * - problem: the sentence lights up word by word while you read it
 * - steps: each card sinks back as the next one slides over it
 * - everything with data-reveal rises as it enters; the permission table fills in row by row; the closing block opens up
 * Only transform, opacity and clip-path are animated.
 */
export function LandingMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add({ calm: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const lines = gsap.utils.toArray<HTMLElement>(".hero-title .ln > span");
      if (ctx.conditions?.calm) {
        gsap.set([...lines, "[data-hero]", "[data-stage]"], { clearProps: "all" });
        gsap.set(".problem-text .w", { opacity: 1 });
        return;
      }

      gsap.set(lines, { yPercent: 110, visibility: "visible" });
      gsap.set("[data-hero]", { y: 24 });
      gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 })
        .to(lines, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0)
        .to("[data-hero]", { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.45)
        .fromTo("[data-stage]", { y: 80, rotate: 5, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.5 }, 0.25);

      gsap.to("[data-stage]", { y: -50, rotate: -1.5, ease: "none", scrollTrigger: { trigger: "[data-hero-section]", start: "top top", end: "bottom top", scrub: true } });

      gsap.to(".problem-text .w", {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".problem-text", start: "top 75%", end: "bottom 55%", scrub: 0.6 },
      });

      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.93 - (cards.length - i) * 0.01, opacity: 0.55, ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 130px", scrub: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
      gsap.from("[data-reveal-row]", {
        x: 40, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: "[data-reveal-row]", start: "top 88%", once: true },
      });
      gsap.from("[data-close]", {
        clipPath: "inset(12% 8% 12% 8% round 28px)", ease: "none",
        scrollTrigger: { trigger: "[data-close]", start: "top bottom", end: "top 30%", scrub: true },
      });
    });

    return () => mm.revert();
  }, []);

  return null;
}
