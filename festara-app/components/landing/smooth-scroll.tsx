"use client";

import { useEffect } from "react";

/**
 * Buttery wheel scrolling for the landing page only: the page eases toward where the wheel points.
 * No library. Touch devices, keyboard scrolling, scrollbars, nested scroll areas and people who ask for less motion are left alone.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;

    let target = window.scrollY, current = target, running = false, raf = 0;
    const limit = () => document.documentElement.scrollHeight - window.innerHeight;

    const tick = () => {
      current += (target - current) * 0.11;
      if (Math.abs(target - current) < 0.4) { current = target; window.scrollTo(0, current); running = false; return; }
      window.scrollTo(0, current);
      raf = requestAnimationFrame(tick);
    };
    const go = (y: number) => {
      target = Math.max(0, Math.min(limit(), y));
      if (!running) { running = true; current = window.scrollY; raf = requestAnimationFrame(tick); }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      for (let el = e.target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
        const s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return;
      }
      e.preventDefault();
      go((running ? target : window.scrollY) + e.deltaY * (e.deltaMode === 1 ? 16 : 1));
    };
    const onScroll = () => { if (!running) { target = window.scrollY; current = target; } };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href");
      if (!a || !id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      go(el.getBoundingClientRect().top + window.scrollY - 96);
      history.replaceState(null, "", id);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
