# Style lock: Festara, "Rangeen Raat" (Hammad's design, locked)

Locked on 2026-10-09 from the approved prototype `design/version-3/index.html` (artifact https://claude.ai/artifact/B2M16x3qe8ERPCJxtpeRN5).
This replaces the earlier style lock (calm paper, no photos, no scroll motion). Do not drift from it without Hammad's say-so.

Source of truth for values: `app/tokens.css` (colour, radius, shadow, motion tokens) and `app/globals.css` (cover pattern, line art, flood, landing). Use tokens, never raw hex.

## Look
- Dark first, light second, both designed; default follows the system (next-themes). Marigold is the one brand accent.
- No photos. Every event is a saturated block in its cover colour (mehndi, marigold, sindoor, kahwa, sky, night) wearing the ajrak-style geometric pattern (`.cover`, drifts slowly) and its own animated line art (`components/brand/event-art.tsx`: mandala, mehrab and lights, jhoomar, rings, balloons and cake, lanterns and crescent, mountains and road, graduation cap).
- Type: Bricolage Grotesque for titles, numbers and card titles (`font-display`, heavy, tight tracking); Instrument Serif italic for the one accent word in a title (`.accent`); Geist for UI; Geist Mono for codes.
- Shape: 20px cards and sheets, 28px for hero and cover blocks, 12px controls, **pill buttons**. Default button wipes up to marigold on hover.
- Status colours stay tied to meaning (ok, warn at 80% budget, over) and always come with a word or icon.

## Motion (Hammad's call: smooth, flowing, never blocking)
- Landing: eased wheel scrolling (`landing/smooth-scroll.tsx`, no library), headline rises line by line, a sentence that lights up word by word, stacked step cards that sink back as the next slides over, an occasions accordion, a permission table that highlights a role, a marquee that speeds with scroll, live mini-demos (cover colours, copy link, role cycling).
- App: a colour flood on page change in the destination event's colour (`route-flood.tsx`), skeleton shimmer, a live second-by-second "Next up" countdown, 3D-tilt cards and invite ticket, self-drawing line art.
- Only transform, opacity and clip-path are animated. `prefers-reduced-motion` gets the finished page at once.

## Layout
- Desktop: shadcn inset sidebar with a marigold active marker; event header is a full cover block with a huge countdown. Below `md`: bottom tab bar (role-aware) as before. Guests get a friendly one-page view instead of a dashboard.
- Events home: "Next up" spotlight, then all upcoming. Event form shows a live preview card. Members page opens with three role cards drawn from `can()`.
- No horizontal scroll at 375, 768 or 1440px.

## Not design (leave alone)
Routes, data, actions, permissions and schema belong to Anas. Keep component props, exports and file names so his work merges cleanly. No institution name anywhere in the app.
