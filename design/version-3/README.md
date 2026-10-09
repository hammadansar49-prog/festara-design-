# Festara design, version 3: "Rangeen Raat"

Built from scratch on top of Anas's real app (`festara-app/`), 100% different from version 2.
Local only now. Run `python -m http.server 5180` inside `design/` and open http://localhost:5180/version-3/ (or open index.html directly). Internet needed for fonts and GSAP/Lenis.

**Follows Anas's app exactly:** the same routes (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/events`, `/events?show=past`, `/events/new`, `/events/[id]`, `/events/[id]/members`, `/events/[id]/settings`, `/profile`, `/invite/[token]`), the seed data (Rashid, Hamza, Sana, Tariq, Areeba; Ayesha's Mehndi, Naran Trip, Spring Tech Fest 2027), the 9 event types, the 6 cover colours, the `can()` permission table, 7-day invite links, the last-Admin rule, the sample 90-day dashboard (same seeded algorithm), Planned Guests/Budget/Tasks, Ctrl K, and light/dark/system theme.

**New look:** no photos. Each event is a saturated block in its cover colour wearing an ajrak-style pattern. Bricolage Grotesque display, Instrument Serif italics, Geist body, Geist Mono numbers. Dark-first with a light theme.

**Motion:** colour-flood page changes in the destination event's colour, kinetic headline, a sentence that lights up word by word, stacked step cards that sink back, an occasions accordion, live demos (cover colours, copy link, role change), a self-drawing chart with hover, 3D-tilt cards and invite ticket, confetti on create and join, magnetic buttons, smooth scroll.
