"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Leans toward the mouse a few degrees. Touch and keyboard users get the plain element. */
export function Tilt({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.classList.add("live");
    ref.current.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
    ref.current.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("live");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={cn("tilt", className)}>
      {children}
    </div>
  );
}
