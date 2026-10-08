# Style lock: Festara

Source of truth: `app/tokens.css` (mirrors `../brand/tokens.css`). Use tokens, never raw hex.

- Mood: calm, warm paper. Ink primary buttons. Marigold is the mark only, never text.
- Type: Fraunces (soft axis, 560) at 24px+ for titles and big numbers; Hanken Grotesk for all UI.
- Covers: mehndi, marigold, sindoor, kahwa, sky, night. Charts alias them (--chart-1..5).
- Shape: radius 12px cards, 6px controls. One shadow only (--shadow-overlay), used on the landing nav pill and overlays.
- Dark mode: runtime toggle (next-themes, data-theme). Both palettes live in tokens.css.
- Assets: no stock photos, no illustrations. Visuals are the product's own components.
- Dashboard: shadcn Sidebar (inset, icon-collapsible) + dashboard-01 layout. Planned modules (Guests, Budget, Tasks) show only as "Planned" nav items; their numbers are sample data tagged "Sample".
- Motion: landing only, GSAP + ScrollTrigger in components/landing/motion.tsx. Each motion plays once (hero entrance, fade-up on enter, budget meter fill). Never alter scrolling: no smooth scroll, pinning, scrubbing or sticky stacks. transform/opacity only. Reduced motion: finished page at once. App chrome has no scroll motion.
- Landing system: one container (max-w-6xl, px-4/sm:px-6), one section rhythm (py-24/lg:py-32), every section head = lbl + Fraunces h2 (text-4xl/sm:text-5xl). Chapters in cover colors: hero frame mehndi, occasions night, close mehndi. No watermarks or decorative shapes inside cover blocks.
- No institution name anywhere in the app.
- App layout (decided 2026-10-08): desktop = Planner's desk (inset sidebar + overview). Phone (below md) = Pocket event: bottom tab bar (components/shell/bottom-tabs.tsx, tabs follow role via can()) and an event-color hero with a big countdown on the overview. Tab bar and hero are md:hidden / below md only. Guests see one friendly page. A "Run of show" timeline may become a tab later.
