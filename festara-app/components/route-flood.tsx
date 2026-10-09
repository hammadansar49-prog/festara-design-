"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

const COVERS = ["mehndi", "marigold", "sindoor", "kahwa", "sky", "night"];

/**
 * When the page changes, the destination's colour floods the screen from where you clicked and then wipes away.
 * Event pages flood in their own cover colour and show the event's name; everything else floods in marigold.
 * The first load and people who ask for less motion see nothing.
 */
export function RouteFlood() {
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLElement>(null);
  const prev = useRef(pathname);
  const click = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const onClick = (e: MouseEvent) => { click.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, []);

  useLayoutEffect(() => {
    if (prev.current === pathname) return; // first load, or a re-run with the same page
    prev.current = pathname;
    const el = layer.current, text = label.current;
    if (!el || !text || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const host = document.querySelector<HTMLElement>("[data-event-cover]");
    const color = host && COVERS.includes(host.dataset.eventCover ?? "") ? host.dataset.eventCover! : null;
    el.style.background = color ? `var(--event-${color})` : "var(--marigold)";
    el.style.color = color ? `var(--event-${color}-fg)` : "#17141B";
    text.textContent = host?.dataset.eventName ?? "";

    const cx = click.current.x || window.innerWidth / 2, cy = click.current.y || window.innerHeight / 2;
    const full = `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${cx}px ${cy}px)`;
    const none = `circle(0px at ${cx}px ${cy}px)`;
    gsap.killTweensOf([el, text]);
    gsap.set(el, { clipPath: full });
    gsap.timeline({ onComplete: () => { gsap.set(el, { clipPath: none }); } })
      .fromTo(text, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "expo.out" })
      .to(text, { yPercent: -40, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=0.1")
      .to(el, { clipPath: none, duration: 0.8, ease: "expo.inOut" }, "-=0.2");
  }, [pathname]);

  return (
    <div ref={layer} className="flood" aria-hidden>
      <b ref={label} />
    </div>
  );
}
