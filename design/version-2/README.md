# Festara design, version 2: site + full app

Hammad's second design prototype. Live version: https://claude.ai/artifact/R73Dq3ybHiphmsmGR3pUcC

Everything from version 1 (three event worlds, themed planners, water-flow scroll), plus the whole app from the 40% spec, each screen with its own transitions:

- `#/login`, `#/register`: split screen with a rotating photo story, live password strength
- `#/events`: "Assalam-o-Alaikum, Hammad", 3D-tilt event cards, role filter with Flip animation, "Create an event" chooser
- `#/event/<id>`: dashboard painted in the event's own world (wedding, university, tour): hero with countdown, counting stats, budget ring, RSVPs, spending, click-to-move tasks, activity
- `#/event/<id>/members`: invite link by role and expiry, QR card, role changes, remove with inline confirm, last-admin guard
- `#/invite/wed`: the guest's view of an invitation, with an accept animation

Page changes use a curtain in the destination event's colour. Data is sample data; nothing is saved.
Open `index.html` in a browser (internet needed for fonts and GSAP/Lenis). Photos from Unsplash.
