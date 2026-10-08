# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Workspace for **Festara**, a NUML BSCS final-year project, with two parts:

- **`festara-app/`**: the web app (Next.js 16, Tailwind, shadcn/ui, Supabase later). Its own repo and its own `AGENTS.md`: read the Next.js docs in `festara-app/node_modules/next/dist/docs/` before writing code, because this version differs from older Next.js.
- **The FYP report**, generated from source in `report_src/` (below).

## Current focus: finish the 40% app

Order of work, decided 2026-10-08. Do not start other work until these are done:

1. **The existing landing page** (`festara-app/components/landing/`) and **the dashboard** (event overview, `festara-app/app/(app)/events/[id]/`) first.
2. Then finish the 40% scope: Auth, Event Management, RBAC with invite links (FR-01..14). Plan and spec: `docs/superpowers/plans/2026-10-08-festara-40-percent-build.md` and `docs/superpowers/specs/`.
3. Guests/RSVP, Budget, Tasks stay **Planned** (sidebar shows "Planned", dashboard numbers are tagged "Sample"). Do not build them for the 40%.

The landing was rebuilt on 2026-10-08 from the sticky-stage prototype (Artifact `https://claude.ai/artifact/2Tr725c2rjY1SFG5L3amhC`), with event cover colors in place of photos (no photos, per the style lock). The user rejected heavy scroll motion: no pinning, smooth scroll, scrubbing or sticky stacks (see `.tastemaker/style-lock.md`).

### App decisions

- **Layout:** desktop = shadcn inset sidebar + overview. Below `md` = bottom tab bar (`components/shell/bottom-tabs.tsx`, tabs follow the role via `can()`) and a cover-color hero with a countdown on the event overview.
- **Brand:** tokens in `festara-app/app/tokens.css` (mirrors `brand/tokens.css`). Use tokens, never raw hex. Fraunces (24px+ only) and Hanken Grotesk. Style notes: `festara-app/.tastemaker/style-lock.md`.
- **Roles are `admin`, `member`, `guest`.** The rules live in `lib/permissions.ts` (`can(role, action)`); UI and server both use it.
- **Data:** everything goes through one `DataSource` interface. Runs on an in-memory mock now (`DATA_SOURCE=mock`); Supabase comes with Tasks 10-13 and needs the user's project keys.
- **No institution name** (NUML) anywhere in the app. Campus is Multan (report and proposal still say Islamabad).
- Money is `Rs 412,000` via `Intl.NumberFormat('en-PK')`.

### App commands (run in `festara-app/`)

```bash
npm run dev        # Next 16 allows only one dev server per project; use the one already on :3000
npm test           # vitest unit tests
npm run test:e2e   # Playwright, uses installed Edge
npx tsc --noEmit && npm run lint
```

Three lint errors in `settings/page.tsx` and `events/error.tsx` (unescaped apostrophes) predate this work. When adding shadcn components, back up first and diff, because the CLI can overwrite edited files.

## The FYP report

The report is a separate deliverable, **paused** for now (do not rebuild it until asked; known pending fixes: campus is Multan not Islamabad, and the schema deviations listed in the build spec). It is generated from source in `report_src/`:

- `Festara_FYP_Report_40_percent.pdf`: print-exact output
- `Festara_FYP_Report_40_percent.docx`: must open cleanly in **Google Docs** (the team opens files from Google Drive)
- `FYP_Proposal_Festara.docx` / `.pdf`: the approved proposal; use it as the source of truth for scope

Do not hand-edit the generated `.pdf`/`.docx`. Edit the source and rebuild.

## Build

Run everything from `report_src/`:

```bash
npm install
pip install pdfplumber pypdf reportlab pypdfium2 matplotlib
python diagrams.py img        # only when a figure changed
python build.py img ../Festara_FYP_Report_40_percent.pdf ../Festara_FYP_Report_40_percent.docx
```

The build needs Microsoft Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (headless printing). Word and LibreOffice are not installed. To check the output visually, render the PDF pages to images with pypdfium2. There are no tests or linters.

## Architecture

One content source produces two outputs:

- **`report.js`** holds all report content (title page, front matter, chapters 1–7, appendices, references), written against the `docx` npm API using small helpers (`P`, `B`, `N`, `H2`–`H4`, `table`, `fig`, `tCap`/`fCap`, `chapterSep`, `useCase`). Inline `**bold**` and `__italic__` markup is parsed by `runs()`.
- **`MODE` env var** selects the backend. `MODE=docx` (default) uses the real `docx` package. `MODE=html` swaps in **`shim.js`**, a stand-in that only records constructor options; **`render.js`** then turns those nodes into `title.html`, `front.html` and `body.html`, plus `entries.json` (headings and captions for the contents lists). Any new `docx` class or enum used in `report.js` must also be added to `shim.js` and handled in `render.js`.
- **`build.py`** runs the pipeline in two passes:
  1. Render HTML, print `body.html` with Edge, then use pdfplumber to find the page of every heading and caption from `entries.json`, and write `html/toc.json`.
  2. Re-render HTML with `TOC_JSON` set so the front matter carries real page numbers. Print title, front and body, stamp page numbers with reportlab (none / lower roman / arabic, bottom right), and merge with pypdf.
  3. Run `report.js` in docx mode with `TOC_JSON` set, which writes **static** contents tables instead of a Word TOC field.

  If a "`! not found:`" warning prints, a heading's text no longer matches what pdfplumber extracts, so its contents entry has the wrong page.
- **`diagrams.py`** draws every figure in `img/` (UML, DFD, ERD, architecture, Gantt) with matplotlib. `img/im7.png` is the NUML logo and is not generated.
- `html/` and `edge-profile/` are build artifacts and the Edge user-data dir. Leave them alone.
- `reference_docs/` contains the official NUML report format, submission guidelines, a sample report, and the meeting-log and 40% undertaking templates. Check these when a formatting question comes up.

## Formatting constraints (NUML + Google Docs)

- A4. Margins: 1.25" left, 1" on the other sides. Times New Roman 12pt, 1.5 line spacing, justified.
- Chapter separator pages have the number at 18pt and the title at 22pt, centered on the page.
- Front matter uses roman page numbers. Arabic numbering restarts at Chapter 1.
- Keep the DOCX Google-Docs-safe: no TOC fields, no section vertical alignment, no exact line heights, and no empty page-break paragraphs. Start new pages with `{ __np: true }` markers, which become section breaks in `buildSections()` and CSS page breaks in the HTML. Earlier versions broke in Google Docs (empty TOC, off-center separators, blank pages) for exactly these reasons.
