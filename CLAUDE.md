# CLAUDE.md

This is the **`hammad-design`** branch of Festara (NUML BSCS final-year project: a web app for planning weddings, university events and tours together).

## Who decides what

- **Hammad owns the design.** Look, layout, colors, fonts, photos, animation, scrolling, page structure and wording are his call. Follow his instructions in the session over anything else in this repo.
- Older design notes, style locks or "the user rejected X" notes from other branches or folders (for example `.tastemaker/style-lock.md` or an older CLAUDE.md on `main`) **do not apply here.** Don't follow them, and don't argue from them.
- The friend builds functionality on `main`. That code is his; we design around it.

Talk to Hammad in Roman Urdu and keep explanations simple.

## Git rules (strict)

1. Commit and push **only to `hammad-design`**.
2. **Never push, merge or open a PR into `main`** (or `master`). A local pre-push hook in Hammad's clone also blocks it.
3. To bring in the friend's new work: `git fetch origin && git merge origin/main` into `hammad-design`. Never the other direction.

## What we change, and what we don't

**Change freely (design):** markup and styling, design tokens, fonts, images and illustrations, animation and scroll behaviour, landing page, page layouts, empty/loading states, copy.

**Don't touch (functionality):** data logic and the `DataSource` layer, Supabase code, server actions, API routes, auth, `lib/permissions.ts`, database schema, tests, and config (`package.json`, `next.config`, env files). If a design needs one of these changed, stop and ask Hammad first.

Keep component props, exports, file names and routes the same, so the friend's work keeps merging in cleanly. Restyle around existing logic; don't rewrite it.

## Hammad's design direction

- **Three event worlds, each with its own look:**
  - **Weddings**: cream and deep green, botanical line drawings, arch-shaped photo frames, Cormorant Garamond with Pinyon Script accents, real wedding photos.
  - **University events**: black and white photos, copper accent, torn-paper shapes, Oswald caps with a handwritten script word.
  - **Tours**: teal and sunset orange, big Anton type, Caveat handwritten notes, mountain photos.
- **Scrolling:** buttery smooth (Lenis + GSAP ScrollTrigger). Scrolling down moves the home screen sideways from Wedding to University to Tours, with flowing "water" edges between worlds, depth parallax and a gentle snap.
- **Pink and green fairy lights (lariyan)** as the festive signature.
- **Each world's "Start planning" opens that world's own planner** (themed multi-step form), ending in an "event ready" screen with a share link and WhatsApp share.
- **Shareable invitation page** for guests in the botanical wedding style: hero photo, arched card, programme, dress code, RSVP.
- Desktop first; phone layout comes later.

Reference prototypes (open these before designing):
- Scroll-story site with the three worlds and planners: https://claude.ai/artifact/Beu6UK8w2cu3WyzzjzCWWE (source also in `D:\festara\site\v3.html`, photos in `D:\festara\site\img\`)
- Wedding invitation (desktop): https://claude.ai/artifact/MkdMaFYpoQGL4ztaSUMMoF

Photos come from Unsplash (free licence); keep a credit in the footer.

## Repo map

- `brand/`: logo, `tokens.css`, brand sheet
- `docs/`: specs and plans
- `fypdocs/`: proposal and report (PDF/DOCX). Generated; don't hand-edit.
- `report_src/`: source for the FYP report. Paused; don't rebuild unless Hammad asks.
- The Next.js app (`festara-app/`) lives in its own repo and is not in this folder yet.
