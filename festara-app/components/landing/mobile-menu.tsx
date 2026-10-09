"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#occasions", label: "Occasions" },
  { href: "#access", label: "Access" },
];

/** Full-screen menu for phones and tablets; the desktop nav lives in landing.tsx. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button" aria-expanded={open} aria-controls="landing-sheet" aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="relative z-[60] grid size-11 place-items-center rounded-full text-foreground hover:bg-secondary md:hidden"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      <nav
        id="landing-sheet" aria-label="Menu" hidden={!open}
        className="fixed inset-0 z-[55] flex flex-col gap-1 bg-background/95 px-6 pt-28 pb-10 backdrop-blur-md animate-in fade-in duration-300 md:hidden"
      >
        {NAV.map((n) => (
          <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="font-display border-b py-3 text-5xl">{n.label}</a>
        ))}
        <Link href="/login" className="font-display border-b py-3 text-5xl" onClick={() => setOpen(false)}>Sign in</Link>
        <Link href="/register" className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground" onClick={() => setOpen(false)}>Create your event</Link>
      </nav>
    </>
  );
}
