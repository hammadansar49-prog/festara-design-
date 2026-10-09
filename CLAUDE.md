# CLAUDE.md

This is the **`hammad-design`** branch of Festara (a BSCS final-year project: a web app for planning weddings, university events and trips together).

Talk to Hammad in Roman Urdu and keep explanations simple. Hammad is the user. His friend **Anas** builds the functionality.

## Who decides what

- **Hammad owns the design.** Look, layout, colours, fonts, animation, scrolling, page structure and wording are his call. Follow his instructions in the session over anything else in this repo.
- Older design notes from other branches or folders (for example `festara-app/.tastemaker/style-lock.md` or an older CLAUDE.md on Anas's `main`) **do not apply here.** Don't follow them and don't argue from them.
- Anas builds the functionality on `main` of his repo. That code is his; we design around it.

## The two repos (read this before any git command)

| Remote name | Repo | What it is |
|---|---|---|
| `mine` | https://github.com/hammadansar49-prog/festara-design-.git | **Hammad's own repo.** All design work goes here first. |
| `origin` | https://github.com/ChestPiece/festara.git | **Anas's repo.** Hammad's finished design goes here later, only on a branch. |

Flow of work:

1. Work on branch `hammad-design`. Commit often.
2. Push to **`mine`**: `git push mine hammad-design`. This is the default and always safe.
3. Push to **`origin`** (Anas's repo) **only when Hammad says he has finished testing and asks for it.** Even then it goes to the branch `hammad-design`, never to `main`: `git push origin hammad-design`.
4. **Never push, merge or open a PR into Anas's `main` (or `master`).** A local pre-push hook in Hammad's clone (`.git/hooks/pre-push`) blocks pushes to `main`/`master` on `origin`. If the hook is missing, recreate it before pushing.
5. To bring in Anas's new work: `git fetch origin && git merge origin/main` into `hammad-design`. Never the other direction.
6. Hammad's repo `mine/main` only holds an "Initial commit" README with unrelated history. Do not force-push over it. Push to branch `hammad-design` there.

If the remotes are missing on a fresh clone:

```bash
git remote add origin https://github.com/ChestPiece/festara.git
git remote add mine https://github.com/hammadansar49-prog/festara-design-.git
```

## What we change, and what we don't

**Change freely (design):** markup and styling, design tokens, fonts, images and illustrations, animation and scroll behaviour, landing page, page layouts, empty/loading states, copy.

**Don't touch (functionality):** data logic and the `DataSource` layer, Supabase code, server actions, API routes, auth, `festara-app/lib/permissions.ts`, database schema, tests, and config (`package.json`, `next.config`, env files). If a design needs one of these changed, stop and ask Hammad first.

Keep component props, exports, file names and routes the same, so Anas's work keeps merging in cleanly. Restyle around existing logic; don't rewrite it.

## Where the design lives

- **Version 3 is the FINAL design** (confirmed by Hammad, 2026-10-09). Online prototype: https://claude.ai/artifact/B2M16x3qe8ERPCJxtpeRN5 (the only Festara artifact kept; all others were deleted). Don't start new design versions; refine this one.
- **`design/version-3/index.html`** is Hammad's chosen design, a single self-contained file (HTML, CSS and JS inline; fonts, GSAP, ScrollTrigger and Lenis load from CDNs). It is the source of truth: edit this file directly. Older versions 1 and 2 were deleted on purpose.
- Open it by running `python -m http.server 5180` inside `design/` and visiting http://localhost:5180/version-3/ (hard refresh with Ctrl+Shift+R after edits). Opening the file directly also works.
- Anas's real app is in `festara-app/` (Next.js 16, React 19, Tailwind 4, shadcn/ui). The prototype is a design reference; the end goal is to bring it into `festara-app/` as restyled components, without changing their logic.
- Before changing anything in `festara-app/`, read `festara-app/AGENTS.md` (this Next.js version differs from older ones) and the Next docs in `festara-app/node_modules/next/dist/docs/` after `npm install`.

## What version 3 is ("Rangeen Raat")

Built on Anas's real app, so it follows his routes and data exactly: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/events`, `/events?show=past`, `/events/new`, `/events/[id]`, `/events/[id]/members`, `/events/[id]/settings`, `/profile`, `/invite/[token]`. Seed data is Anas's (`festara-app/lib/data/seed.ts`): Rashid, Hamza, Sana, Tariq, Areeba; Ayesha's Mehndi, Naran Trip, Spring Tech Fest 2027 (plus two sample events added in the prototype: Zara's Walima and Eid Milan 2026). Sign-in password for the mock is `festara123`. Roles are admin, member and guest, enforced through `can(role, action)`; Guests, Budget and Tasks are "Planned" (sample numbers carry a "Sample" tag).

Look and feel:
- **No photos.** Each event is a saturated block in its cover colour (mehndi, marigold, sindoor, kahwa, sky, night) wearing an ajrak-style geometric pattern, plus its own animated line art per event type (mandala, mehrab and lights, jhoomar, rings, balloons and cake, lanterns and crescent, mountains and road, graduation cap).
- Dark-first with a light theme and a system/light/dark toggle.
- Fonts: Bricolage Grotesque (display), Instrument Serif italics (accent), Geist (body), Geist Mono (numbers).
- Motion: kinetic hero headline, a sentence that lights up word by word, stacked step cards that sink back, an occasions accordion that opens on hover, live mini-demos (cover colours, copy link, role cycling), a permission matrix that highlights a role, colour-flood page transitions in the destination event's colour, skeleton shimmer, a self-drawing chart with hover tooltip, a live second-by-second "Next up" countdown, 3D-tilt cards and invite ticket, confetti on create/join/copy, magnetic buttons, smooth scroll (Lenis). Everything respects `prefers-reduced-motion`.
- Responsive: desktop sidebar; at 980px and below the sidebar becomes a slide-in drawer and a bottom tab bar appears; the landing gets a full-screen menu; no horizontal scroll at 375, 768 or 1440px.
- Guests see a friendly one-page view instead of a dashboard.

## Rules for the design work

- Use tokens (CSS variables) for colours; don't scatter raw hex.
- Keep text contrast readable in both themes; always pair status colour with a word or icon.
- Every interactive element needs a visible focus state, a real `<button>` or `<a>`, and a label for icon-only buttons.
- Keep animation purposeful: transform/opacity, and always a reduced-motion fallback.
- Test at 375px, 768px and 1440px and make sure there is no horizontal scroll.
- Test with a real browser (Browser pane) after changes, not just by reading code.

## Repo map

- `design/version-3/`: the design prototype (see above)
- `festara-app/`: Anas's Next.js app
- `brand/`: logo, `tokens.css`, brand sheet from the earlier brand work
- `docs/`: specs and plans (the 40% build spec and plan)
- `fypdocs/`: proposal and report (PDF/DOCX). Generated; don't hand-edit.
- `report_src/`: source for the FYP report. Paused; don't rebuild unless Hammad asks.
