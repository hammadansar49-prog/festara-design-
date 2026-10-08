# Festara 40% Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Festara 40% milestone (FR-01 to FR-14: authentication, event management, role-based access with invite links) as a working Next.js app on Supabase, with the brand applied to every screen.

**Architecture:** UI first on an in-memory mock, then Supabase. Every screen and server action talks to one `DataSource` interface. `can(role, action)` and the Zod schemas are shared by UI, actions, mock and tests. The mock enforces the same rules as the database, so swapping `DATA_SOURCE=mock` to `supabase` changes behaviour only where the real backend is stricter.

**Tech Stack:** Node 20.9+, Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zod, Vitest, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Vercel.

**Spec:** `docs/superpowers/specs/2026-10-08-festara-40-percent-build-design.md`. Read its sections 3, 6 and 7 first.

## Global Constraints

Every task's requirements include this section.

- Working directory for all app code: `C:\Users\Anas Altaf\Desktop\Development\fyp\festara-app` (own git repo). Docs and brand files live one level up in `..\docs`, `..\brand`.
- Shell commands below are bash (Git Bash). In PowerShell, run them from Git Bash or translate paths.
- Node.js 20.9 or newer. Next.js 16: the request interceptor file is `proxy.ts` exporting `proxy`, never `middleware.ts`.
- Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Server code uses `supabase.auth.getClaims()` or `getUser()`, never `getSession()`, to trust a user.
- App env: `DATA_SOURCE=mock` or `supabase`.
- Money is written `Rs 412,000` (`formatMoney`). Never format money inline.
- Styling uses tokens from `brand/tokens.css` only. No raw hex, no Tailwind default palette colors (`bg-blue-500` and similar), no `rounded-xl` outside the radius roles (6 px controls, 12 px cards and dialogs, full for avatars and chips).
- Fonts: Hanken Grotesk for all UI; Fraunces only at 24 px or larger, via the `.font-display` class from `tokens.css`.
- Copy follows the brand Voice section: plain, specific, no emoji, no "oops", no exclamation marks, buttons name the action.
- Roles: `admin`, `member`, `guest`. Event types: `wedding`, `engagement`, `mehndi`, `walima`, `birthday`, `eid_gathering`, `trip`, `university_event`, `other`. Cover colors: `mehndi`, `marigold`, `sindoor`, `kahwa`, `sky`, `night`.
- Invite token: 16 random bytes, URL-safe base64 (22 characters). Expiry 7 days.
- Exact user-facing messages (tests and report test cases depend on these):
  - `INVITE_INVALID` = `This invite link is invalid or has expired.`
  - `NO_ACCESS` = `This event doesn't exist, or you don't have access to it.`
  - `LAST_ADMIN` = `Every event needs at least one Admin. Make someone else Admin first.`
  - wrong login = `Invalid login credentials`
- Commits: small, one per task step marked "Commit", message style `feat:`, `test:`, `chore:`, `fix:`. Run commands from `festara-app`.
- Do not add dependencies beyond those named in this plan.
- Campus is Multan. The report is out of scope for now: do not edit `report_src/` or rebuild the report. Pending report edits go in `docs/acceptance/report-todo.md` (Task 13).
- Before using a framework API from memory (Next.js, shadcn, Supabase, Zod), look it up: Context7 (`resolve-library-id`, then `query-docs`) if the MCP is available in the session, otherwise the official docs page. Follow the docs over this plan if they differ, and note the difference in the commit message.

## File Structure

Created in `festara-app/` unless noted. One responsibility per file.

| Path | Responsibility |
|---|---|
| `lib/constants.ts` | Event types, cover colors, labels, invite days |
| `lib/messages.ts` | The exact shared user-facing messages |
| `lib/format.ts` | `formatMoney` |
| `lib/permissions.ts` | `Role`, `Action`, `can()` |
| `lib/validation/common.ts` | `parseForm`, `formDataToObject` |
| `lib/validation/auth.ts` | register, login, forgot, reset schemas |
| `lib/validation/profile.ts` | profile schema |
| `lib/validation/event.ts` | event schema, `isPastDate` |
| `lib/validation/invite.ts` | invitation role schema |
| `lib/data/result.ts` | `Result`, `ok`, `fail` |
| `lib/data/types.ts` | entity types and the `DataSource` interface |
| `lib/data/mock.ts` | `MockDataSource` and `createStore` |
| `lib/data/seed.ts` | sample data from the brand book |
| `lib/data/supabase.ts` | `SupabaseDataSource` (Task 12) |
| `lib/data/index.ts` | `getDataSource()` switch |
| `lib/actions/*.ts` | server actions: auth, profile, events, members |
| `lib/supabase/{client,server,proxy}.ts` | Supabase clients and session refresh (Task 12) |
| `proxy.ts` | session refresh and route protection (Task 12) |
| `components/brand/wordmark.tsx` | generated inline logo |
| `components/*.tsx` | event card, role badge, header, forms, members panel, dialogs |
| `app/**` | routes (spec section 4). Signed-in pages live in the route group `app/(app)/` (events, profile) so they share one layout and URLs stay `/events`, `/profile` |
| `lib/date.ts` | `formatEventDate`, `daysUntil` |
| `lib/actions/state.ts` | `ActionState` type shared by form actions |
| `supabase/migrations/000{1,2,3}_*.sql` | schema, functions, RLS (Tasks 10, 11) |
| `supabase/tests/rls.test.ts` | policy script (Task 11) |
| `scripts/gen-wordmark.mjs` | one-off generator for the logo component |

---

### Task 1: Scaffold the app

**Files:**
- Create: `festara-app/` (generated), `vitest.config.ts`, `app/tokens.css`, `scripts/gen-wordmark.mjs`, `components/brand/wordmark.tsx`, `.env.example`
- Modify: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `next.config.ts`, `package.json`

**Interfaces:**
- Produces: working dev server, `npm test` (Vitest), alias `@/` for the project root, brand tokens loaded, `<Wordmark />` and `<Star />` components, fonts exposed as `--font-hanken` and `--font-fraunces`.

- [ ] **Step 1: Check Node and the current Next.js scaffold command**

Run:
```bash
node --version
```
Expected: `v20.9.0` or higher. If lower, install Node 22 LTS first.

Open https://nextjs.org/docs/app/getting-started/installation and confirm `npx create-next-app@latest <name> --yes` is still the recommended command. (Verified on 2026-10-08: defaults are TypeScript, ESLint, Tailwind, App Router, Turbopack, `@/*` alias, no `src/`.)

- [ ] **Step 2: Create the project**

Run from `C:\Users\Anas Altaf\Desktop\Development\fyp`:
```bash
npx create-next-app@latest festara-app --yes
cd festara-app
git log --oneline
```
Expected: the app is created and `git log` shows an initial commit (create-next-app runs `git init`). If there is no repository, run `git init && git add -A && git commit -m "chore: scaffold"`.

- [ ] **Step 3: Turn off Cache Components if the scaffold enabled it**

Open `next.config.ts`. If it contains `cacheComponents: true`, change it to `false` (this app's pages read cookies and are dynamic):
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
};

export default nextConfig;
```
If the option is absent, leave the file unchanged.

- [ ] **Step 4: Install runtime and test dependencies**

Run:
```bash
npm install zod @supabase/supabase-js @supabase/ssr
npm install -D vitest
```
Expected: installs without errors.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: { environment: "node", include: ["lib/**/*.test.ts", "supabase/tests/**/*.test.ts"] },
});
```
In `package.json` add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Initialise shadcn/ui and add components**

Run:
```bash
npx shadcn@latest init -t next
```
Accept the defaults (base color Neutral). Then:
```bash
npx shadcn@latest add button input label textarea card dialog select dropdown-menu avatar badge sonner skeleton separator
```
Expected: files appear under `components/ui/`. Check https://ui.shadcn.com/docs/installation/next if a command is rejected.

- [ ] **Step 7: Replace shadcn's colors with the Festara tokens**

```bash
cp ../brand/tokens.css app/tokens.css
```
Open `app/globals.css`. Make three edits:
1. After the existing `@import` lines at the top, add `@import "./tokens.css";`.
2. Delete the generated `:root { ... }` block, the `.dark { ... }` block, and the `@theme inline { ... }` block (tokens.css provides all of them), and delete any `@custom-variant dark (...)` line.
3. Delete the generated `@layer base { ... }` block (tokens.css provides body and focus styles).

Keep any `tw-animate-css` or `shadcn/tailwind.css` imports.

- [ ] **Step 8: Fonts and root layout**

Replace `app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Hanken_Grotesk, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "opsz"] });

export const metadata: Metadata = {
  title: { default: "Festara", template: "%s | Festara" },
  description: "Plan an event together: guests, budget and tasks in one shared place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Generate the logo component from the brand SVG**

Create `scripts/gen-wordmark.mjs`:
```js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const svg = readFileSync("../brand/logo/wordmark.svg", "utf8");
const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
const inner = svg
  .replace(/^[\s\S]*?role="img"[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replaceAll('fill="#1C1A22"', 'fill="currentColor"')
  .replaceAll('stroke="#1C1A22"', 'stroke="currentColor"')
  .replaceAll('fill="#E9A23B"', 'fill="var(--marigold)"')
  .replaceAll("stroke-width", "strokeWidth")
  .replaceAll("stroke-linejoin", "strokeLinejoin");

const star = readFileSync("../brand/logo/star.svg", "utf8");
const starInner = star
  .replace(/^[\s\S]*?role="img"[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replaceAll('fill="#1C1A22"', 'fill="currentColor"')
  .replaceAll('stroke="#1C1A22"', 'stroke="currentColor"')
  .replaceAll('fill="#E9A23B"', 'fill="var(--marigold)"')
  .replaceAll("stroke-width", "strokeWidth")
  .replaceAll("stroke-linejoin", "strokeLinejoin");

mkdirSync("components/brand", { recursive: true });
writeFileSync(
  "components/brand/wordmark.tsx",
  `// Generated by scripts/gen-wordmark.mjs from brand/logo. Do not edit by hand.
export function Wordmark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="${viewBox}" role="img" aria-label="festara" className={className}>
      ${inner}
    </svg>
  );
}

export function Star({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Festara" className={className}>
      ${starInner}
    </svg>
  );
}
`
);
console.log("wrote components/brand/wordmark.tsx");
```
Run:
```bash
node scripts/gen-wordmark.mjs
```
Expected: `wrote components/brand/wordmark.tsx`.

- [ ] **Step 10: Temporary home page that proves tokens and fonts**

Replace `app/page.tsx`:
```tsx
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4">
      <Wordmark className="h-10 w-auto" />
      <h1 className="font-display text-4xl">A calm place for people planning something together.</h1>
      <Button className="w-fit">Create event</Button>
    </main>
  );
}
```

- [ ] **Step 11: Verify in the browser and build**

Run:
```bash
npm run dev
```
Open http://localhost:3000. Expected: warm paper background, the festara wordmark with its marigold star, a Fraunces headline, an ink button. Stop the server, then:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 12: Env example and commit**

Create `.env.example`:
```
DATA_SOURCE=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
Copy to `.env.local` with `DATA_SOURCE=mock`. Run:
```bash
git add -A
git commit -m "chore: scaffold Next.js 16 app with shadcn, brand tokens and fonts"
```

- [ ] **Step 13: Deploy the empty shell (needs your accounts)**

Push the repo to GitHub, import it in Vercel, set `DATA_SOURCE=mock`. Expected: the Vercel URL shows the same page as Step 11. Skip if you prefer to deploy after Task 9; note the decision in the spec.

---

### Task 2: formatMoney

**Files:**
- Create: `lib/format.ts`
- Test: `lib/format.test.ts`

**Interfaces:**
- Produces: `formatMoney(amount: number): string`. Used everywhere money is shown.

- [ ] **Step 1: Write the failing test**

Create `lib/format.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("puts Rs first and groups thousands", () => {
    expect(formatMoney(412000)).toBe("Rs 412,000");
  });
  it("writes zero", () => {
    expect(formatMoney(0)).toBe("Rs 0");
  });
  it("groups millions", () => {
    expect(formatMoney(1250000)).toBe("Rs 1,250,000");
  });
  it("rounds away paisa", () => {
    expect(formatMoney(88000.6)).toBe("Rs 88,001");
  });
  it("puts the minus sign before Rs", () => {
    expect(formatMoney(-5000)).toBe("-Rs 5,000");
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/format.test.ts`
Expected: FAIL, cannot find module `./format`.

- [ ] **Step 3: Implement**

Create `lib/format.ts`:
```ts
const rupees = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

/** Whole rupees, Rs first: formatMoney(412000) === "Rs 412,000". */
export function formatMoney(amount: number): string {
  return `${amount < 0 ? "-" : ""}Rs ${rupees.format(Math.abs(amount))}`;
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/format.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/format.test.ts
git commit -m "feat: add formatMoney"
```

---

### Task 3: Permissions (`can`)

**Files:**
- Create: `lib/permissions.ts`
- Test: `lib/permissions.test.ts`

**Interfaces:**
- Produces: `type Role = "admin" | "member" | "guest"`, `const ROLES`, `type Action`, `const ACTIONS`, `can(role: Role | null | undefined, action: Action): boolean`. Encodes report Table 5.2.

- [ ] **Step 1: Write the failing test**

The expected table is written out independently from the implementation, row for row from report Table 5.2.

Create `lib/permissions.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { ACTIONS, can, type Action, type Role } from "./permissions";

// [action, admin, member, guest] straight from report Table 5.2
const TABLE: [Action, boolean, boolean, boolean][] = [
  ["event.viewBasic", true, true, true],
  ["event.viewFull", true, true, false],
  ["event.edit", true, false, false],
  ["event.delete", true, false, false],
  ["invite.create", true, false, false],
  ["member.manage", true, false, false],
  ["guest.add", true, true, false],
  ["expense.log", true, true, false],
  ["task.create", true, false, false],
  ["task.updateOwn", true, true, false],
  ["rsvp.confirmOwn", true, true, true],
  ["dashboard.view", true, false, false],
];

describe("can", () => {
  it("covers every action in the table exactly once", () => {
    expect(TABLE.map((r) => r[0]).sort()).toEqual([...ACTIONS].sort());
  });

  for (const [action, admin, member, guest] of TABLE) {
    it(`${action}: admin=${admin} member=${member} guest=${guest}`, () => {
      const roles: [Role, boolean][] = [["admin", admin], ["member", member], ["guest", guest]];
      for (const [role, expected] of roles) expect(can(role, action)).toBe(expected);
    });
  }

  it("denies everything without a role", () => {
    for (const action of ACTIONS) {
      expect(can(null, action)).toBe(false);
      expect(can(undefined, action)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run lib/permissions.test.ts`
Expected: FAIL, cannot find module `./permissions`.

- [ ] **Step 3: Implement**

Create `lib/permissions.ts`:
```ts
export const ROLES = ["admin", "member", "guest"] as const;
export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  "event.viewBasic",
  "event.viewFull",
  "event.edit",
  "event.delete",
  "invite.create",
  "member.manage",
  "guest.add",
  "expense.log",
  "task.create",
  "task.updateOwn",
  "rsvp.confirmOwn",
  "dashboard.view",
] as const;
export type Action = (typeof ACTIONS)[number];

// Report Table 5.2. The database enforces the same rules with RLS (supabase/migrations/0003_rls.sql).
const ALLOWED: Record<Action, readonly Role[]> = {
  "event.viewBasic": ["admin", "member", "guest"],
  "event.viewFull": ["admin", "member"],
  "event.edit": ["admin"],
  "event.delete": ["admin"],
  "invite.create": ["admin"],
  "member.manage": ["admin"],
  "guest.add": ["admin", "member"],
  "expense.log": ["admin", "member"],
  "task.create": ["admin"],
  "task.updateOwn": ["admin", "member"],
  "rsvp.confirmOwn": ["admin", "member", "guest"],
  "dashboard.view": ["admin"],
};

export function can(role: Role | null | undefined, action: Action): boolean {
  return role != null && ALLOWED[action].includes(role);
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run lib/permissions.test.ts`
Expected: all pass (14 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/permissions.ts lib/permissions.test.ts
git commit -m "feat: add can() permission matrix from report Table 5.2"
```

---

### Task 4: Constants, messages and Zod schemas

**Files:**
- Create: `lib/constants.ts`, `lib/messages.ts`, `lib/validation/common.ts`, `lib/validation/auth.ts`, `lib/validation/profile.ts`, `lib/validation/event.ts`, `lib/validation/invite.ts`
- Test: `lib/validation/validation.test.ts`

**Interfaces:**
- Produces: `EVENT_TYPES`, `EventType`, `EVENT_TYPE_LABELS`, `COVER_COLORS`, `CoverColor`, `COVER_LABELS`, `INVITE_DAYS`; messages `INVITE_INVALID`, `NO_ACCESS`, `LAST_ADMIN`, `NOT_SIGNED_IN`; `parseForm(schema, input)` returning `{ ok: true, data } | { ok: false, fieldErrors }`; `formDataToObject(fd)`; schemas `registerSchema`, `loginSchema`, `forgotSchema`, `resetSchema`, `profileSchema`, `eventSchema`, `invitationSchema`; types `RegisterInput`, `ProfileInput`, `EventInput`; `isPastDate(iso, today?)`.

- [ ] **Step 1: Constants and messages**

Create `lib/constants.ts`:
```ts
export const EVENT_TYPES = [
  "wedding", "engagement", "mehndi", "walima", "birthday",
  "eid_gathering", "trip", "university_event", "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  mehndi: "Mehndi",
  walima: "Walima",
  birthday: "Birthday",
  eid_gathering: "Eid gathering",
  trip: "Trip",
  university_event: "University event",
  other: "Other",
};

export const COVER_COLORS = ["mehndi", "marigold", "sindoor", "kahwa", "sky", "night"] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

export const COVER_LABELS: Record<CoverColor, string> = {
  mehndi: "Mehndi green",
  marigold: "Marigold",
  sindoor: "Sindoor",
  kahwa: "Kahwa",
  sky: "Sky",
  night: "Night",
};

export const INVITE_DAYS = 7;
```

Create `lib/messages.ts`:
```ts
export const INVITE_INVALID = "This invite link is invalid or has expired.";
export const NO_ACCESS = "This event doesn't exist, or you don't have access to it.";
export const LAST_ADMIN = "Every event needs at least one Admin. Make someone else Admin first.";
export const NOT_SIGNED_IN = "Sign in to continue.";
```

- [ ] **Step 2: Write the failing test**

Create `lib/validation/validation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseForm, formDataToObject } from "./common";
import { loginSchema, registerSchema, resetSchema } from "./auth";
import { profileSchema } from "./profile";
import { eventSchema, isPastDate } from "./event";
import { invitationSchema } from "./invite";

const goodEvent = {
  name: "Ayesha's Mehndi",
  type: "mehndi",
  eventDate: "2026-12-14",
  location: "Lahore",
  description: "",
  totalBudget: "500,000",
  coverColor: "mehndi",
};

describe("registerSchema", () => {
  it("accepts valid details and normalises the email", () => {
    const r = parseForm(registerSchema, { fullName: " Rashid Mehmood ", email: "Rashid@Example.com", password: "festara123" });
    expect(r).toEqual({ ok: true, data: { fullName: "Rashid Mehmood", email: "rashid@example.com", password: "festara123" } });
  });
  it("rejects a short password and a bad email", () => {
    const r = parseForm(registerSchema, { fullName: "Rashid", email: "nope", password: "short" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.fieldErrors.email).toBe("Enter a valid email address.");
      expect(r.fieldErrors.password).toBe("Use at least 8 characters.");
    }
  });
});

describe("loginSchema and resetSchema", () => {
  it("requires a password on login", () => {
    const r = parseForm(loginSchema, { email: "a@b.co", password: "" });
    expect(r.ok).toBe(false);
  });
  it("requires 8 characters on reset", () => {
    expect(parseForm(resetSchema, { password: "1234567" }).ok).toBe(false);
    expect(parseForm(resetSchema, { password: "12345678" }).ok).toBe(true);
  });
});

describe("profileSchema", () => {
  it("turns an empty phone into null", () => {
    const r = parseForm(profileSchema, { fullName: "Rashid Mehmood", phone: "" });
    expect(r).toEqual({ ok: true, data: { fullName: "Rashid Mehmood", phone: null } });
  });
  it("accepts a Pakistani mobile number", () => {
    expect(parseForm(profileSchema, { fullName: "Rashid", phone: "0300 1234567" }).ok).toBe(true);
  });
  it("rejects letters in the phone", () => {
    const r = parseForm(profileSchema, { fullName: "Rashid", phone: "call me" });
    expect(r.ok).toBe(false);
  });
});

describe("eventSchema", () => {
  it("parses a formatted budget string to a number and nulls empty optionals", () => {
    const r = parseForm(eventSchema, goodEvent);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.totalBudget).toBe(500000);
      expect(r.data.description).toBeNull();
    }
  });
  it("rejects a negative budget with the report message (TC-05)", () => {
    const r = parseForm(eventSchema, { ...goodEvent, totalBudget: "-100" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.totalBudget).toBe("Budget can't be negative. Enter an amount of 0 or more.");
  });
  it("rejects an empty budget and a non-number", () => {
    expect(parseForm(eventSchema, { ...goodEvent, totalBudget: "" }).ok).toBe(false);
    expect(parseForm(eventSchema, { ...goodEvent, totalBudget: "lots" }).ok).toBe(false);
  });
  it("rejects an unknown type and a missing name", () => {
    expect(parseForm(eventSchema, { ...goodEvent, type: "party" }).ok).toBe(false);
    expect(parseForm(eventSchema, { ...goodEvent, name: " " }).ok).toBe(false);
  });
  it("defaults the cover color", () => {
    const { coverColor: _omit, ...rest } = goodEvent;
    const r = parseForm(eventSchema, rest);
    expect(r.ok && r.data.coverColor).toBe("mehndi");
  });
});

describe("isPastDate", () => {
  const today = new Date(2026, 9, 8); // 8 Oct 2026, local
  it("flags yesterday but not today", () => {
    expect(isPastDate("2026-10-07", today)).toBe(true);
    expect(isPastDate("2026-10-08", today)).toBe(false);
    expect(isPastDate("2026-12-14", today)).toBe(false);
  });
});

describe("invitationSchema and formDataToObject", () => {
  it("allows only member or guest", () => {
    expect(parseForm(invitationSchema, { role: "member" }).ok).toBe(true);
    expect(parseForm(invitationSchema, { role: "guest" }).ok).toBe(true);
    expect(parseForm(invitationSchema, { role: "admin" }).ok).toBe(false);
  });
  it("turns FormData into a plain object of strings", () => {
    const fd = new FormData();
    fd.set("role", "guest");
    expect(formDataToObject(fd)).toEqual({ role: "guest" });
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run lib/validation/validation.test.ts`
Expected: FAIL, cannot find module `./common`.

- [ ] **Step 4: Implement the helpers and schemas**

Create `lib/validation/common.ts`:
```ts
import type { z } from "zod";

export type FieldErrors = Record<string, string>;
export type ParseResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors };

/** Parse input with a schema; on failure return the first message per field. */
export function parseForm<S extends z.ZodTypeAny>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors };
}

export function formDataToObject(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of fd.entries()) if (typeof value === "string") out[key] = value;
  return out;
}
```

Create `lib/validation/auth.ts`:
```ts
import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email,
  password: z.string().min(8, "Use at least 8 characters."),
});
export type RegisterInput = z.output<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.output<typeof loginSchema>;

export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ password: z.string().min(8, "Use at least 8 characters.") });
```

Create `lib/validation/profile.ts`:
```ts
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^\+?[0-9 ()-]{7,16}$/.test(v), "Enter a valid phone number, like 0300 1234567."),
});
export type ProfileInput = z.output<typeof profileSchema>;
```

Create `lib/validation/event.ts`:
```ts
import { z } from "zod";
import { COVER_COLORS, EVENT_TYPES } from "@/lib/constants";

const budget = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v : v.trim() === "" ? NaN : Number(v.replace(/,/g, ""))))
  .refine((n) => Number.isFinite(n), "Enter a budget as a number, like 500000.")
  .refine((n) => n >= 0, "Budget can't be negative. Enter an amount of 0 or more.");

export const eventSchema = z.object({
  name: z.string().trim().min(2, "Give the event a name.").max(80, "Keep the name under 80 characters."),
  type: z.enum(EVENT_TYPES, { message: "Choose an event type." }),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  location: z.string().trim().max(120, "Keep the location under 120 characters.").optional().transform((v) => v || null),
  description: z.string().trim().max(500, "Keep the description under 500 characters.").optional().transform((v) => v || null),
  totalBudget: budget,
  coverColor: z.enum(COVER_COLORS).default("mehndi"),
});
export type EventInput = z.output<typeof eventSchema>;

/** True when an ISO date (YYYY-MM-DD) is before today in local time. UC-01 extension 4b asks the user to confirm. */
export function isPastDate(iso: string, today: Date = new Date()): boolean {
  return iso < today.toLocaleDateString("en-CA");
}
```

Create `lib/validation/invite.ts`:
```ts
import { z } from "zod";

export const invitationSchema = z.object({ role: z.enum(["member", "guest"]) });
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run lib/validation/validation.test.ts`
Expected: all pass. If `z.enum(..., { message })` or `.email()` is rejected by the installed Zod version, check https://zod.dev for the current signature and adjust, keeping the exact messages.

- [ ] **Step 6: Commit**

```bash
git add lib
git commit -m "feat: add constants, messages and Zod schemas"
```

---

### Task 5: DataSource interface, mock implementation and seed

**Files:**
- Create: `lib/data/result.ts`, `lib/data/types.ts`, `lib/data/mock.ts`, `lib/data/seed.ts`, `lib/data/index.ts`
- Test: `lib/data/mock.test.ts`

**Interfaces:**
- Consumes: `can`, `Role` (Task 3); `EventInput`, `ProfileInput`, `RegisterInput` (Task 4); messages (Task 4).
- Produces: `Result<T>`, `ok()`, `fail()`; entity types; `DataSource`; `createStore()`, `MockDataSource`, `SessionStore`; `seedStore(store)`; `getDataSource()`.

- [ ] **Step 1: Result helpers and the DataSource interface**

Create `lib/data/result.ts`:
```ts
export type ErrorCode = "invalid" | "forbidden" | "not_found" | "last_admin" | "invite_invalid" | "exists" | "auth";

export type Result<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; message: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (code: ErrorCode, message: string): Result<never> => ({ ok: false, code, message });
```

Create `lib/data/types.ts`:
```ts
import type { CoverColor, EventType } from "@/lib/constants";
import type { Role } from "@/lib/permissions";
import type { RegisterInput } from "@/lib/validation/auth";
import type { EventInput } from "@/lib/validation/event";
import type { ProfileInput } from "@/lib/validation/profile";
import type { Result } from "./result";

export interface Profile { id: string; fullName: string; email: string; phone: string | null }

export interface EventRecord {
  id: string;
  name: string;
  type: EventType;
  eventDate: string; // YYYY-MM-DD
  location: string | null;
  description: string | null;
  totalBudget: number;
  coverColor: CoverColor;
  createdBy: string;
  createdAt: string; // ISO
}
export interface EventSummary extends EventRecord { role: Role; memberCount: number }
export interface EventDetail { event: EventRecord; role: Role; memberCount: number }

export interface Member { userId: string; fullName: string; email: string; role: Role; joinedAt: string }

export type InviteRole = "member" | "guest";
export interface Invitation { id: string; eventId: string; token: string; role: InviteRole; expiresAt: string; usedCount: number }
export interface InvitePreview {
  eventName: string;
  eventDate: string;
  location: string | null;
  coverColor: CoverColor;
  inviterName: string;
  role: InviteRole;
}

export interface DataSource {
  // auth and profile (FR-01 to FR-04)
  signUp(input: RegisterInput): Promise<Result<{ needsConfirmation: boolean }>>;
  signIn(input: { email: string; password: string }): Promise<Result<Profile>>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<Result<null>>;
  resetPassword(newPassword: string): Promise<Result<null>>;
  getCurrentUser(): Promise<Profile | null>;
  updateProfile(input: ProfileInput): Promise<Result<Profile>>;

  // events (FR-05 to FR-09)
  listMyEvents(): Promise<EventSummary[]>;
  getEvent(eventId: string): Promise<Result<EventDetail>>;
  createEvent(input: EventInput): Promise<Result<EventRecord>>;
  updateEvent(eventId: string, input: EventInput): Promise<Result<EventRecord>>;
  deleteEvent(eventId: string, confirmName: string): Promise<Result<null>>;

  // members and invitations (FR-10 to FR-14)
  listMembers(eventId: string): Promise<Result<Member[]>>;
  changeRole(eventId: string, userId: string, role: Role): Promise<Result<null>>;
  removeMember(eventId: string, userId: string): Promise<Result<null>>;
  createInvitation(eventId: string, role: InviteRole): Promise<Result<Invitation>>;
  listInvitations(eventId: string): Promise<Result<Invitation[]>>;
  getInvitationPreview(token: string): Promise<Result<InvitePreview>>;
  acceptInvitation(token: string): Promise<Result<{ eventId: string }>>;
}
```

- [ ] **Step 2: Write the failing test for the mock**

Create `lib/data/mock.test.ts`:
```ts
import { beforeEach, describe, expect, it } from "vitest";
import { createStore, MockDataSource, type SessionStore, type Store } from "./mock";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS } from "@/lib/messages";
import type { EventInput } from "@/lib/validation/event";

const DAY = 86_400_000;
let clock = new Date("2026-10-08T10:00:00Z");

function memorySession(): SessionStore {
  let uid: string | undefined;
  return { get: async () => uid, set: async (id) => void (uid = id), clear: async () => void (uid = undefined) };
}

let store: Store;
let n = 0;
async function actor(email: string, fullName = email.split("@")[0]): Promise<MockDataSource> {
  const ds = new MockDataSource(store, { session: memorySession(), now: () => clock, newId: () => `id-${++n}` });
  const existing = store.users.find((u) => u.email === email);
  if (existing) await ds.signIn({ email, password: "festara123" });
  else await ds.signUp({ fullName, email, password: "festara123" });
  return ds;
}

const input: EventInput = {
  name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
  description: null, totalBudget: 500000, coverColor: "mehndi",
};

beforeEach(() => { store = createStore(); n = 0; clock = new Date("2026-10-08T10:00:00Z"); });

describe("auth", () => {
  it("registers, then signs in; wrong password gives the exact message (TC-02)", async () => {
    await actor("rashid@example.com", "Rashid Mehmood");
    const other = new MockDataSource(store, { session: memorySession() });
    const bad = await other.signIn({ email: "rashid@example.com", password: "wrong" });
    expect(bad).toEqual({ ok: false, code: "auth", message: "Invalid login credentials" });
    const good = await other.signIn({ email: "rashid@example.com", password: "festara123" });
    expect(good.ok && good.data.fullName).toBe("Rashid Mehmood");
  });
  it("rejects a duplicate email", async () => {
    await actor("rashid@example.com");
    const again = new MockDataSource(store, { session: memorySession() });
    const r = await again.signUp({ fullName: "Other", email: "rashid@example.com", password: "festara123" });
    expect(r.ok).toBe(false);
  });
  it("updates the profile (FR-04)", async () => {
    const a = await actor("rashid@example.com", "Rashid Mehmood");
    const r = await a.updateProfile({ fullName: "Rashid M.", phone: "0300 1234567" });
    expect(r.ok && r.data.phone).toBe("0300 1234567");
    expect((await a.getCurrentUser())?.fullName).toBe("Rashid M.");
  });
});

describe("events", () => {
  it("makes the creator Admin (FR-06, TC-04)", async () => {
    const a = await actor("rashid@example.com");
    const created = await a.createEvent(input);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const detail = await a.getEvent(created.data.id);
    expect(detail.ok && detail.data.role).toBe("admin");
  });
  it("lists only my events with my role (FR-09, TC-13)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    await a.createEvent(input);
    await b.createEvent({ ...input, name: "Naran Trip", type: "trip", coverColor: "sky" });
    const mine = await a.listMyEvents();
    expect(mine.map((e) => e.name)).toEqual(["Ayesha's Mehndi"]);
    expect(mine[0].role).toBe("admin");
    expect(mine[0].memberCount).toBe(1);
  });
  it("hides an event from a non-member (TC-10)", async () => {
    const a = await actor("rashid@example.com");
    const d = await actor("outsider@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    expect(await d.getEvent(created.data.id)).toEqual({ ok: false, code: "not_found", message: NO_ACCESS });
    expect(await d.listMyEvents()).toEqual([]);
  });
  it("lets only the Admin edit (FR-07, TC-06)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const inv = await a.createInvitation(created.data.id, "member");
    if (!inv.ok) throw new Error("setup");
    await b.acceptInvitation(inv.data.token);
    const denied = await b.updateEvent(created.data.id, { ...input, name: "Hacked" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("forbidden");
    const allowed = await a.updateEvent(created.data.id, { ...input, name: "Ayesha's Mehndi Night" });
    expect(allowed.ok && allowed.data.name).toBe("Ayesha's Mehndi Night");
  });
  it("deletes only with the exact name, and removes it for everyone (FR-08, TC-11)", async () => {
    const a = await actor("rashid@example.com");
    const b = await actor("hamza@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const inv = await a.createInvitation(created.data.id, "member");
    if (!inv.ok) throw new Error("setup");
    await b.acceptInvitation(inv.data.token);
    expect((await a.deleteEvent(created.data.id, "wrong name")).ok).toBe(false);
    const memberTry = await b.deleteEvent(created.data.id, "Ayesha's Mehndi");
    expect(memberTry.ok).toBe(false);
    expect((await a.deleteEvent(created.data.id, "Ayesha's Mehndi")).ok).toBe(true);
    expect(await a.listMyEvents()).toEqual([]);
    expect(await b.listMyEvents()).toEqual([]);
    expect(store.invitations).toEqual([]);
  });
});

describe("invitations", () => {
  async function setup() {
    const a = await actor("rashid@example.com");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    return { a, eventId: created.data.id };
  }
  it("lets only the Admin create links; token is 22 URL-safe chars valid 7 days (FR-10)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    expect(inv.ok).toBe(true);
    if (!inv.ok) return;
    expect(inv.data.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(new Date(inv.data.expiresAt).getTime() - clock.getTime()).toBe(7 * DAY);
    await b.acceptInvitation(inv.data.token);
    const denied = await b.createInvitation(eventId, "guest");
    expect(denied.ok).toBe(false);
  });
  it("adds the user with the link's role and counts the use (FR-11, TC-07)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    if (!inv.ok) throw new Error("setup");
    const r = await b.acceptInvitation(inv.data.token);
    expect(r).toEqual({ ok: true, data: { eventId } });
    const detail = await b.getEvent(eventId);
    expect(detail.ok && detail.data.role).toBe("member");
    expect(store.invitations[0].usedCount).toBe(1);
  });
  it("keeps the existing role when an existing member opens a link (UC-02 4a)", async () => {
    const { a, eventId } = await setup();
    const inv = await a.createInvitation(eventId, "guest");
    if (!inv.ok) throw new Error("setup");
    await a.acceptInvitation(inv.data.token);
    const detail = await a.getEvent(eventId);
    expect(detail.ok && detail.data.role).toBe("admin");
    expect(store.invitations[0].usedCount).toBe(0);
  });
  it("rejects unknown and expired links with the exact message (FR-12, TC-08)", async () => {
    const { a, eventId } = await setup();
    const b = await actor("hamza@example.com");
    const inv = await a.createInvitation(eventId, "member");
    if (!inv.ok) throw new Error("setup");
    expect(await b.acceptInvitation("nope")).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    clock = new Date(clock.getTime() + 8 * DAY);
    expect(await b.acceptInvitation(inv.data.token)).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    expect((await b.getInvitationPreview(inv.data.token)).ok).toBe(false);
    expect(await b.listMyEvents()).toEqual([]);
  });
  it("previews a valid link without joining", async () => {
    const { a, eventId } = await setup();
    const inv = await a.createInvitation(eventId, "guest");
    if (!inv.ok) throw new Error("setup");
    const anon = new MockDataSource(store, { session: memorySession(), now: () => clock });
    const p = await anon.getInvitationPreview(inv.data.token);
    expect(p.ok && p.data.eventName).toBe("Ayesha's Mehndi");
    expect(p.ok && p.data.inviterName).toBe("rashid");
    expect(p.ok && p.data.role).toBe("guest");
  });
});

describe("members and roles", () => {
  async function setup() {
    const a = await actor("rashid@example.com", "Rashid");
    const b = await actor("hamza@example.com", "Hamza");
    const g = await actor("tariq@example.com", "Tariq");
    const created = await a.createEvent(input);
    if (!created.ok) throw new Error("setup");
    const eventId = created.data.id;
    const m = await a.createInvitation(eventId, "member");
    const gi = await a.createInvitation(eventId, "guest");
    if (!m.ok || !gi.ok) throw new Error("setup");
    await b.acceptInvitation(m.data.token);
    await g.acceptInvitation(gi.data.token);
    return { a, b, g, eventId, hamzaId: (await b.getCurrentUser())!.id, rashidId: (await a.getCurrentUser())!.id };
  }
  it("lists members for Admin and Member but not Guest", async () => {
    const { a, b, g, eventId } = await setup();
    const list = await a.listMembers(eventId);
    expect(list.ok && list.data.map((x) => x.role)).toEqual(["admin", "member", "guest"]);
    expect((await b.listMembers(eventId)).ok).toBe(true);
    const denied = await g.listMembers(eventId);
    expect(denied.ok).toBe(false);
  });
  it("lets only the Admin change roles or remove people (FR-13, TC-14)", async () => {
    const { a, b, eventId, hamzaId } = await setup();
    expect((await b.changeRole(eventId, hamzaId, "admin")).ok).toBe(false);
    expect((await a.changeRole(eventId, hamzaId, "guest")).ok).toBe(true);
    expect((await a.removeMember(eventId, hamzaId)).ok).toBe(true);
    expect(await b.listMyEvents()).toEqual([]);
  });
  it("blocks demoting or removing the last Admin (TC-09)", async () => {
    const { a, b, eventId, hamzaId, rashidId } = await setup();
    const demote = await a.changeRole(eventId, rashidId, "member");
    expect(demote).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    const remove = await a.removeMember(eventId, rashidId);
    expect(remove).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    await a.changeRole(eventId, hamzaId, "admin");
    expect((await a.changeRole(eventId, rashidId, "member")).ok).toBe(true);
    expect((await b.removeMember(eventId, rashidId)).ok).toBe(true);
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run lib/data/mock.test.ts`
Expected: FAIL, cannot find module `./mock`.

- [ ] **Step 4: Implement the mock**

Create `lib/data/mock.ts`:
```ts
import { randomBytes, randomUUID } from "node:crypto";
import { INVITE_DAYS } from "@/lib/constants";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS, NOT_SIGNED_IN } from "@/lib/messages";
import { can, type Role } from "@/lib/permissions";
import type { RegisterInput } from "@/lib/validation/auth";
import type { EventInput } from "@/lib/validation/event";
import type { ProfileInput } from "@/lib/validation/profile";
import { fail, ok, type Result } from "./result";
import type {
  DataSource, EventDetail, EventRecord, EventSummary, Invitation, InvitePreview, InviteRole, Member, Profile,
} from "./types";

export interface SessionStore {
  get(): Promise<string | undefined>;
  set(userId: string): Promise<void>;
  clear(): Promise<void>;
}

type UserRow = Profile & { password: string };
type MemberRow = { eventId: string; userId: string; role: Role; joinedAt: string };
type InviteRow = Invitation & { createdBy: string };
export interface Store { users: UserRow[]; events: EventRecord[]; members: MemberRow[]; invitations: InviteRow[] }
export const createStore = (): Store => ({ users: [], events: [], members: [], invitations: [] });

export interface MockDeps {
  session: SessionStore;
  now?: () => Date;
  newId?: () => string;
  newToken?: () => string;
}

const DAY = 86_400_000;
const toProfile = (u: UserRow): Profile => ({ id: u.id, fullName: u.fullName, email: u.email, phone: u.phone });

/**
 * In-memory DataSource used for the UI-first prototype and unit tests.
 * It enforces the same rules as the database: roles, last Admin, expiry, already-member keeps role.
 */
export class MockDataSource implements DataSource {
  private session: SessionStore;
  private now: () => Date;
  private newId: () => string;
  private newToken: () => string;

  constructor(private store: Store, deps: MockDeps) {
    this.session = deps.session;
    this.now = deps.now ?? (() => new Date());
    this.newId = deps.newId ?? randomUUID;
    this.newToken = deps.newToken ?? (() => randomBytes(16).toString("base64url"));
  }

  // ---- helpers ----
  private async me(): Promise<Profile | null> {
    const id = await this.session.get();
    const row = id ? this.store.users.find((u) => u.id === id) : undefined;
    return row ? toProfile(row) : null;
  }
  private roleOf(eventId: string, userId: string): Role | null {
    return this.store.members.find((m) => m.eventId === eventId && m.userId === userId)?.role ?? null;
  }
  private adminCount(eventId: string): number {
    return this.store.members.filter((m) => m.eventId === eventId && m.role === "admin").length;
  }
  private memberCount(eventId: string): number {
    return this.store.members.filter((m) => m.eventId === eventId).length;
  }
  private isActive(inv: InviteRow): boolean {
    return new Date(inv.expiresAt).getTime() > this.now().getTime();
  }

  // ---- auth and profile ----
  async signUp(input: RegisterInput) {
    if (this.store.users.some((u) => u.email === input.email)) {
      return fail("exists", "An account with this email already exists. Sign in instead.");
    }
    const row: UserRow = { id: this.newId(), fullName: input.fullName, email: input.email, phone: null, password: input.password };
    this.store.users.push(row);
    await this.session.set(row.id);
    return ok({ needsConfirmation: false });
  }
  async signIn(input: { email: string; password: string }) {
    const row = this.store.users.find((u) => u.email === input.email && u.password === input.password);
    if (!row) return fail("auth", "Invalid login credentials");
    await this.session.set(row.id);
    return ok(toProfile(row));
  }
  async signOut() {
    await this.session.clear();
  }
  async requestPasswordReset(_email: string) {
    return ok(null); // never reveal whether an address has an account
  }
  async resetPassword(newPassword: string) {
    const id = await this.session.get();
    const row = this.store.users.find((u) => u.id === id);
    if (!row) return fail("auth", "Your reset link has expired. Request a new one.");
    row.password = newPassword;
    return ok(null);
  }
  getCurrentUser() {
    return this.me();
  }
  async updateProfile(input: ProfileInput) {
    const id = await this.session.get();
    const row = this.store.users.find((u) => u.id === id);
    if (!row) return fail("auth", NOT_SIGNED_IN);
    row.fullName = input.fullName;
    row.phone = input.phone;
    return ok(toProfile(row));
  }

  // ---- events ----
  async listMyEvents(): Promise<EventSummary[]> {
    const user = await this.me();
    if (!user) return [];
    return this.store.events
      .map((e) => ({ e, role: this.roleOf(e.id, user.id) }))
      .filter((x): x is { e: EventRecord; role: Role } => x.role !== null)
      .map(({ e, role }) => ({ ...e, role, memberCount: this.memberCount(e.id) }))
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }
  async getEvent(eventId: string): Promise<Result<EventDetail>> {
    const user = await this.me();
    const role = user ? this.roleOf(eventId, user.id) : null;
    const event = this.store.events.find((e) => e.id === eventId);
    if (!user || !role || !event) return fail("not_found", NO_ACCESS);
    return ok({ event, role, memberCount: this.memberCount(eventId) });
  }
  async createEvent(input: EventInput): Promise<Result<EventRecord>> {
    const user = await this.me();
    if (!user) return fail("auth", NOT_SIGNED_IN);
    const event: EventRecord = { id: this.newId(), ...input, createdBy: user.id, createdAt: this.now().toISOString() };
    this.store.events.push(event);
    this.store.members.push({ eventId: event.id, userId: user.id, role: "admin", joinedAt: event.createdAt });
    return ok(event);
  }
  async updateEvent(eventId: string, input: EventInput): Promise<Result<EventRecord>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.edit")) return fail("forbidden", "Only the Admin can edit this event.");
    Object.assign(detail.data.event, input);
    return ok(detail.data.event);
  }
  async deleteEvent(eventId: string, confirmName: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.delete")) return fail("forbidden", "Only the Admin can delete this event.");
    if (confirmName.trim() !== detail.data.event.name) return fail("invalid", "Type the event name exactly to confirm.");
    this.store.events = this.store.events.filter((e) => e.id !== eventId);
    this.store.members = this.store.members.filter((m) => m.eventId !== eventId);
    this.store.invitations = this.store.invitations.filter((i) => i.eventId !== eventId);
    return ok(null);
  }

  // ---- members ----
  async listMembers(eventId: string): Promise<Result<Member[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.viewFull")) return fail("forbidden", "You don't have access to the member list.");
    const order: Record<Role, number> = { admin: 0, member: 1, guest: 2 };
    const members = this.store.members
      .filter((m) => m.eventId === eventId)
      .map((m) => {
        const u = this.store.users.find((x) => x.id === m.userId)!;
        return { userId: u.id, fullName: u.fullName, email: u.email, role: m.role, joinedAt: m.joinedAt };
      })
      .sort((a, b) => order[a.role] - order[b.role] || a.joinedAt.localeCompare(b.joinedAt));
    return ok(members);
  }
  async changeRole(eventId: string, userId: string, role: Role): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can change roles.");
    const target = this.store.members.find((m) => m.eventId === eventId && m.userId === userId);
    if (!target) return fail("not_found", "That person isn't a member of this event.");
    if (target.role === "admin" && role !== "admin" && this.adminCount(eventId) === 1) return fail("last_admin", LAST_ADMIN);
    target.role = role;
    return ok(null);
  }
  async removeMember(eventId: string, userId: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can remove people.");
    const target = this.store.members.find((m) => m.eventId === eventId && m.userId === userId);
    if (!target) return fail("not_found", "That person isn't a member of this event.");
    if (target.role === "admin" && this.adminCount(eventId) === 1) return fail("last_admin", LAST_ADMIN);
    this.store.members = this.store.members.filter((m) => m !== target);
    return ok(null);
  }

  // ---- invitations ----
  async createInvitation(eventId: string, role: InviteRole): Promise<Result<Invitation>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can create invite links.");
    const user = (await this.me())!;
    const row: InviteRow = {
      id: this.newId(), eventId, token: this.newToken(), role,
      expiresAt: new Date(this.now().getTime() + INVITE_DAYS * DAY).toISOString(),
      usedCount: 0, createdBy: user.id,
    };
    this.store.invitations.push(row);
    return ok(row);
  }
  async listInvitations(eventId: string): Promise<Result<Invitation[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can see invite links.");
    return ok(this.store.invitations.filter((i) => i.eventId === eventId && this.isActive(i)));
  }
  async getInvitationPreview(token: string): Promise<Result<InvitePreview>> {
    const inv = this.store.invitations.find((i) => i.token === token);
    const event = inv && this.isActive(inv) ? this.store.events.find((e) => e.id === inv.eventId) : undefined;
    if (!inv || !event) return fail("invite_invalid", INVITE_INVALID);
    const inviter = this.store.users.find((u) => u.id === inv.createdBy);
    return ok({
      eventName: event.name, eventDate: event.eventDate, location: event.location,
      coverColor: event.coverColor, inviterName: inviter?.fullName ?? "The organiser", role: inv.role,
    });
  }
  async acceptInvitation(token: string): Promise<Result<{ eventId: string }>> {
    const user = await this.me();
    if (!user) return fail("auth", "Sign in to join this event.");
    const inv = this.store.invitations.find((i) => i.token === token);
    if (!inv || !this.isActive(inv)) return fail("invite_invalid", INVITE_INVALID);
    if (this.roleOf(inv.eventId, user.id)) return ok({ eventId: inv.eventId }); // already a member: keep role
    this.store.members.push({ eventId: inv.eventId, userId: user.id, role: inv.role, joinedAt: this.now().toISOString() });
    inv.usedCount += 1;
    return ok({ eventId: inv.eventId });
  }
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run lib/data/mock.test.ts`
Expected: all pass. If a test fails, fix the implementation, not the test, unless the test contradicts the spec.

- [ ] **Step 6: Seed data and the data source switch**

Create `lib/data/seed.ts`:
```ts
import type { Store } from "./mock";

/** Sample data from the brand book. All sign-ins use the password festara123. */
export function seedStore(store: Store): Store {
  const pw = "festara123";
  store.users.push(
    { id: "u-rashid", fullName: "Rashid Mehmood", email: "rashid@example.com", phone: "0300 1234567", password: pw },
    { id: "u-hamza", fullName: "Hamza Rashid", email: "hamza@example.com", phone: null, password: pw },
    { id: "u-sana", fullName: "Sana Rashid", email: "sana@example.com", phone: null, password: pw },
    { id: "u-tariq", fullName: "Tariq Mehmood", email: "tariq@example.com", phone: null, password: pw },
    { id: "u-areeba", fullName: "Areeba Khan", email: "areeba@example.com", phone: null, password: pw },
  );
  const at = "2026-10-01T09:00:00.000Z";
  store.events.push(
    { id: "e-mehndi", name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
      description: "Family only. Dholki at 7, dinner at 9.", totalBudget: 500000, coverColor: "mehndi", createdBy: "u-rashid", createdAt: at },
    { id: "e-naran", name: "Naran Trip", type: "trip", eventDate: "2027-06-20", location: "Naran, Khyber Pakhtunkhwa",
      description: null, totalBudget: 150000, coverColor: "sky", createdBy: "u-hamza", createdAt: at },
    { id: "e-fest", name: "NUML Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "NUML Islamabad",
      description: null, totalBudget: 350000, coverColor: "night", createdBy: "u-areeba", createdAt: at },
  );
  store.members.push(
    { eventId: "e-mehndi", userId: "u-rashid", role: "admin", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-hamza", role: "member", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-sana", role: "member", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-tariq", role: "guest", joinedAt: at },
    { eventId: "e-naran", userId: "u-hamza", role: "admin", joinedAt: at },
    { eventId: "e-naran", userId: "u-rashid", role: "member", joinedAt: at },
    { eventId: "e-fest", userId: "u-areeba", role: "admin", joinedAt: at },
    { eventId: "e-fest", userId: "u-rashid", role: "member", joinedAt: at },
  );
  return store;
}
```

Create `lib/data/index.ts`:
```ts
import { cookies } from "next/headers";
import { createStore, MockDataSource, type SessionStore, type Store } from "./mock";
import { seedStore } from "./seed";
import type { DataSource } from "./types";

const g = globalThis as unknown as { __festaraStore?: Store };

function cookieSession(): SessionStore {
  return {
    async get() { return (await cookies()).get("festara_mock_uid")?.value; },
    async set(id) { (await cookies()).set("festara_mock_uid", id, { httpOnly: true, sameSite: "lax", path: "/" }); },
    async clear() { (await cookies()).delete("festara_mock_uid"); },
  };
}

/** The one place that chooses the backend. Screens and actions call this, never an implementation. */
export async function getDataSource(): Promise<DataSource> {
  if (process.env.DATA_SOURCE === "supabase") {
    const { SupabaseDataSource } = await import("./supabase");
    return new SupabaseDataSource();
  }
  g.__festaraStore ??= seedStore(createStore());
  return new MockDataSource(g.__festaraStore, { session: cookieSession() });
}

export const isMock = () => process.env.DATA_SOURCE !== "supabase";
```
(`./supabase` does not exist yet; Task 12 creates it. Until then `DATA_SOURCE` must stay `mock`.)

- [ ] **Step 7: Full test run, type check, commit**

Run:
```bash
npm test
npx tsc --noEmit
```
Expected: all tests pass. `tsc` will report a missing module `./supabase` in `lib/data/index.ts`. Add this stub, which Task 12 replaces:

Create `lib/data/supabase.ts`:
```ts
import type { DataSource } from "./types";

// Replaced in Task 12. Until then DATA_SOURCE must stay "mock".
export const SupabaseDataSource = class {
  constructor() {
    throw new Error("The Supabase data source is added in Task 12. Set DATA_SOURCE=mock.");
  }
} as unknown as new () => DataSource;
```
Re-run `npx tsc --noEmit` until it is clean.

```bash
git add -A
git commit -m "feat: add DataSource interface, in-memory mock with database rules, seed data"
```

---

### Task 6: Shared UI foundations and the authentication screens

Covers FR-01, FR-02, FR-03 (screens and actions on the mock).

**Files:**
- Create: `lib/date.ts`, `lib/date.test.ts`, `lib/text.ts`, `lib/text.test.ts`, `lib/actions/state.ts`, `lib/actions/auth.ts`, `components/field.tsx`, `components/sample-banner.tsx`, `components/role-badge.tsx`, `components/event-card.tsx`, `components/auth/auth-forms.tsx`, `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`
- Modify: `app/page.tsx`, `components/ui/{button,input,card,dialog,select,dropdown-menu}.tsx`

**Interfaces:**
- Consumes: `getDataSource`, `isMock` (Task 5); schemas and `parseForm`, `formDataToObject` (Task 4).
- Produces: `formatEventDate(iso)`, `daysUntil(iso, today?)`, `daysLeft(iso, now?)`, `initials(name)`; `ActionState`; `signInAction`, `signUpAction`, `forgotPasswordAction`, `resetPasswordAction`, `signOutAction`; `<Field>`, `<SampleBanner>`, `<RoleBadge role>`, `<EventCard event href?>`.

- [ ] **Step 1: Write the failing tests for date and text helpers**

Create `lib/date.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { daysLeft, daysUntil, formatEventDate } from "./date";

describe("formatEventDate", () => {
  it("writes weekday, day, month and year", () => {
    expect(formatEventDate("2026-12-14")).toBe("Mon 14 Dec 2026");
    expect(formatEventDate("2027-03-20")).toBe("Sat 20 Mar 2027");
  });
});

describe("daysUntil", () => {
  it("counts whole calendar days from today", () => {
    expect(daysUntil("2026-12-14", new Date(2026, 9, 8, 15, 30))).toBe(67);
    expect(daysUntil("2026-10-08", new Date(2026, 9, 8, 23, 59))).toBe(0);
    expect(daysUntil("2026-10-07", new Date(2026, 9, 8))).toBe(-1);
  });
});

describe("daysLeft", () => {
  it("rounds up and never goes below zero", () => {
    expect(daysLeft("2026-10-15T10:00:00Z", new Date("2026-10-08T10:00:00Z"))).toBe(7);
    expect(daysLeft("2026-10-15T10:00:00Z", new Date("2026-10-08T12:00:00Z"))).toBe(7);
    expect(daysLeft("2026-10-01T10:00:00Z", new Date("2026-10-08T10:00:00Z"))).toBe(0);
  });
});
```
Create `lib/text.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { initials } from "./text";

describe("initials", () => {
  it("uses the first letters of the first and last word", () => {
    expect(initials("Rashid Mehmood")).toBe("RM");
    expect(initials("Muhammad Sami Ullah")).toBe("MU");
  });
  it("handles one word and blanks", () => {
    expect(initials("Areeba")).toBe("A");
    expect(initials("  ")).toBe("?");
  });
});
```

- [ ] **Step 2: Run them and watch them fail**

Run: `npx vitest run lib/date.test.ts lib/text.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

Create `lib/date.ts`:
```ts
const dateFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** "2026-12-14" -> "Mon 14 Dec 2026" */
export function formatEventDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00`)).replace(",", "");
}

/** Whole calendar days from today to an ISO date. Negative when the date has passed. */
export function daysUntil(iso: string, today: Date = new Date()): number {
  const target = new Date(`${iso}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** Days until a timestamp, rounded up, never below zero. Used for invite expiry. */
export function daysLeft(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));
}
```
Create `lib/text.ts`:
```ts
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
```

- [ ] **Step 4: Run them and watch them pass**

Run: `npx vitest run lib/date.test.ts lib/text.test.ts`
Expected: all pass.

- [ ] **Step 5: Match shadcn controls to the brand**

Run:
```bash
grep -n "h-9\|shadow-sm\|shadow-lg\|shadow-md" components/ui/button.tsx components/ui/input.tsx components/ui/card.tsx components/ui/dialog.tsx components/ui/select.tsx components/ui/dropdown-menu.tsx
```
Edit each match to follow these rules (the brand sets controls at 40 px, cards flat, one overlay shadow):

| File | Change |
|---|---|
| `button.tsx` | `size.default` height `h-9` becomes `h-10`; `size.lg` height becomes `h-12` |
| `input.tsx` | `h-9` becomes `h-10` |
| `select.tsx` | trigger `h-9` becomes `h-10`; content `shadow-md` becomes `shadow-[var(--shadow-overlay)]` |
| `card.tsx` | remove `shadow-sm` |
| `dialog.tsx` | content `shadow-lg` becomes `shadow-[var(--shadow-overlay)]` |
| `dropdown-menu.tsx` | content shadows become `shadow-[var(--shadow-overlay)]` |

- [ ] **Step 6: Action state and auth actions**

Create `lib/actions/state.ts`:
```ts
export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  confirmPast?: boolean;
};
```
Create `lib/actions/auth.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "@/lib/validation/auth";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import type { ActionState } from "./state";

/** Only allow same-site paths as a post-login destination. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/events";
}

export async function signInAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(loginSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: { email: raw.email ?? "" } };
  const result = await (await getDataSource()).signIn(parsed.data);
  if (!result.ok) return { message: result.message, values: { email: parsed.data.email } };
  redirect(safeNext(raw.next));
}

export async function signUpAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(registerSchema, raw);
  const values = { fullName: raw.fullName ?? "", email: raw.email ?? "" };
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values };
  const result = await (await getDataSource()).signUp(parsed.data);
  if (!result.ok) return { message: result.message, values };
  if (result.data.needsConfirmation) {
    return { ok: true, message: "Check your email. We sent a link to confirm your account." };
  }
  redirect(safeNext(raw.next));
}

export async function forgotPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(forgotSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: { email: raw.email ?? "" } };
  await (await getDataSource()).requestPasswordReset(parsed.data.email);
  return { ok: true, message: "If an account exists for that email, we sent a reset link." };
}

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = parseForm(resetSchema, formDataToObject(fd));
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };
  const result = await (await getDataSource()).resetPassword(parsed.data.password);
  if (!result.ok) return { message: result.message };
  redirect("/events");
}

export async function signOutAction(): Promise<void> {
  await (await getDataSource()).signOut();
  redirect("/login");
}
```

- [ ] **Step 7: Small shared components**

Create `components/field.tsx`:
```tsx
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";

export function Field({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-over">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
```
Create `components/sample-banner.tsx`:
```tsx
import { isMock } from "@/lib/data";

export function SampleBanner() {
  if (!isMock()) return null;
  return (
    <div role="note" className="bg-warn-tint px-4 py-2 text-center text-xs text-warn">
      Prototype on sample data. Sign in as rashid@example.com with the password festara123. Nothing here is saved to a database.
    </div>
  );
}
```
Create `components/role-badge.tsx`:
```tsx
import type { Role } from "@/lib/permissions";

const LABEL: Record<Role, string> = { admin: "Admin", member: "Member", guest: "Guest" };

export function RoleBadge({ role, className = "" }: { role: Role; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full bg-secondary px-2.5 text-xs font-semibold text-secondary-foreground ${className}`}>
      {LABEL[role]}
    </span>
  );
}
```
Create `components/event-card.tsx`:
```tsx
import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { RoleBadge } from "@/components/role-badge";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { EventSummary } from "@/lib/data/types";
import { formatEventDate } from "@/lib/date";

export type CardEvent = Pick<EventSummary, "name" | "type" | "eventDate" | "location" | "coverColor" | "role" | "memberCount">;

export function EventCard({ event, href }: { event: CardEvent; href?: string }) {
  const card = (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
      <div
        className="flex min-h-32 flex-col justify-end gap-1.5 p-5"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <span className="lbl opacity-85">{EVENT_TYPE_LABELS[event.type]}</span>
        <h2 className="font-display text-[1.75rem]">{event.name}</h2>
      </div>
      <div className="grid gap-2 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <span>{formatEventDate(event.eventDate)}</span>
          <RoleBadge role={event.role} className="ml-auto" />
        </div>
        {event.location && (
          <div className="flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden />{event.location}</div>
        )}
        <div className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden />
          {event.memberCount} {event.memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </article>
  );
  return href ? (
    <Link href={href} className="block rounded-lg transition-transform active:scale-[0.98]">{card}</Link>
  ) : card;
}
```

- [ ] **Step 8: The four auth forms**

Create `components/auth/auth-forms.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction, resetPasswordAction, signInAction, signUpAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/state";

const initial: ActionState = {};

function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}
    >
      {state.message}
    </p>
  );
}

const describe = (state: ActionState, key: string) => (state.fieldErrors?.[key] ? `${key}-error` : undefined);

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Signing in" : "Sign in"}</Button>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline underline-offset-4">Forgot your password? Send a reset link</Link>
        <span>New to Festara? <Link href={`/register${q}`} className="font-semibold text-foreground underline underline-offset-4">Create an account</Link></span>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormMessage state={state} />
      <Field id="fullName" label="Full name" error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={state.values?.fullName}
          aria-invalid={!!state.fieldErrors?.fullName} aria-describedby={describe(state, "fullName")} />
      </Field>
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Field id="password" label="Password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password") ?? "password-hint"} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Creating account" : "Create account"}</Button>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href={`/login${q}`} className="font-semibold text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormMessage state={state} />
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!state.fieldErrors?.email} aria-describedby={describe(state, "email")} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Sending" : "Send reset link"}</Button>
      <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4">Back to sign in</Link>
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormMessage state={state} />
      <Field id="password" label="New password" error={state.fieldErrors?.password} hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!state.fieldErrors?.password} aria-describedby={describe(state, "password") ?? "password-hint"} />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Saving" : "Save new password"}</Button>
    </form>
  );
}
```

- [ ] **Step 9: Auth layout, pages and the root redirect**

Create `app/(auth)/layout.tsx`:
```tsx
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { EventCard } from "@/components/event-card";
import { SampleBanner } from "@/components/sample-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SampleBanner />
      <div className="grid min-h-dvh lg:grid-cols-2">
        <main className="flex flex-col justify-center gap-8 px-4 py-12 sm:px-12 lg:px-16">
          <Link href="/" aria-label="Festara home" className="self-start"><Wordmark className="h-7 w-auto" /></Link>
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <aside className="hidden items-center justify-center border-l bg-secondary p-12 lg:flex" aria-hidden>
          <div className="grid w-full max-w-sm gap-4">
            <span className="lbl text-muted-foreground">Your events live here</span>
            <EventCard event={{ name: "NUML Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "NUML Islamabad", coverColor: "night", role: "admin", memberCount: 14 }} />
          </div>
        </aside>
      </div>
    </>
  );
}
```
Create `app/(auth)/login/page.tsx`:
```tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to see the events you belong to.</p>
      </div>
      <LoginForm next={next ?? ""} />
    </div>
  );
}
```
Create `app/(auth)/register/page.tsx`:
```tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Create your account</h1>
        <p className="text-muted-foreground">One account for every event you plan or join.</p>
      </div>
      <RegisterForm next={next ?? ""} />
    </div>
  );
}
```
Create `app/(auth)/forgot-password/page.tsx`:
```tsx
import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Reset your password</h1>
        <p className="text-muted-foreground">Enter your email and we will send you a link.</p>
      </div>
      <ForgotForm />
    </div>
  );
}
```
Create `app/(auth)/reset-password/page.tsx`:
```tsx
import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Choose a new password</h1>
        <p className="text-muted-foreground">Use at least 8 characters.</p>
      </div>
      <ResetForm />
    </div>
  );
}
```
Replace `app/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";

export default async function Home() {
  const user = await (await getDataSource()).getCurrentUser();
  redirect(user ? "/events" : "/login");
}
```

- [ ] **Step 10: Verify**

Run `npx tsc --noEmit` (expect no errors; `/events` does not exist yet, so the redirect target is a plain string and compiles), then `npm run dev` and open http://localhost:3000.
Expected: redirected to `/login`; two-column layout with the sample event card on large screens; the prototype banner on top.
Check by hand:
1. Submit empty form: field errors with the warning icon.
2. Wrong password for `rashid@example.com`: message `Invalid login credentials`.
3. `rashid@example.com` / `festara123`: redirected to `/events` (a 404 until Task 7 is fine).
4. `/register`: a new account signs in and redirects.
5. `/forgot-password`: shows the reset-link sentence for any email.

- [ ] **Step 11: Commit**

```bash
npm test
git add -A
git commit -m "feat: authentication screens, actions and shared UI components on mock data"
```

---

### Task 7: Events (home, create, overview, settings, delete)

Covers FR-05, FR-06, FR-07, FR-08, FR-09.

**Files:**
- Create: `lib/actions/events.ts`, `lib/data/queries.ts`, `components/app-header.tsx`, `components/user-menu.tsx`, `components/event-tabs.tsx`, `components/event-form.tsx`, `components/delete-event-dialog.tsx`, `app/(app)/layout.tsx`, `app/(app)/events/page.tsx`, `app/(app)/events/loading.tsx`, `app/(app)/events/error.tsx`, `app/(app)/events/new/page.tsx`, `app/(app)/events/[id]/layout.tsx`, `app/(app)/events/[id]/page.tsx`, `app/(app)/events/[id]/not-found.tsx`, `app/(app)/events/[id]/settings/page.tsx`
- Modify: `lib/messages.ts`

**Interfaces:**
- Consumes: everything from Tasks 3 to 6.
- Produces: `createEventAction`, `updateEventAction(eventId, prev, fd)`, `deleteEventAction(eventId, prev, fd)`; `getEventCached(id)`; `<EventForm action defaults submitLabel>`.

- [ ] **Step 1: Past-date message and event actions**

Append to `lib/messages.ts`:
```ts
export const PAST_DATE = "That date has already passed. Tick the box to keep it, or choose a new date.";
```
Create `lib/actions/events.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import { PAST_DATE } from "@/lib/messages";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import { eventSchema, isPastDate } from "@/lib/validation/event";
import type { ActionState } from "./state";

export async function createEventAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(eventSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  if (isPastDate(parsed.data.eventDate) && raw.confirmPast !== "yes") {
    return { confirmPast: true, message: PAST_DATE, values: raw };
  }
  const result = await (await getDataSource()).createEvent(parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath("/events");
  redirect(`/events/${result.data.id}`);
}

export async function updateEventAction(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(eventSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  if (isPastDate(parsed.data.eventDate) && raw.confirmPast !== "yes") {
    return { confirmPast: true, message: PAST_DATE, values: raw };
  }
  const result = await (await getDataSource()).updateEvent(eventId, parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath(`/events/${eventId}`, "layout");
  return { ok: true, message: "Changes saved." };
}

export async function deleteEventAction(eventId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const confirmName = String(fd.get("confirmName") ?? "");
  const result = await (await getDataSource()).deleteEvent(eventId, confirmName);
  if (!result.ok) return { message: result.message };
  revalidatePath("/events");
  redirect("/events");
}
```
Create `lib/data/queries.ts`:
```ts
import { cache } from "react";
import { getDataSource } from "@/lib/data";

/** One event lookup per request, shared by the event layout and its pages. */
export const getEventCached = cache(async (eventId: string) => (await getDataSource()).getEvent(eventId));
```

- [ ] **Step 2: Signed-in shell**

Create `components/user-menu.tsx`:
```tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/text";

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" className="rounded-full">
        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary text-xs font-semibold">{initials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild>
          <form action={signOutAction}><button type="submit" className="w-full text-left">Sign out</button></form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```
Create `components/app-header.tsx`:
```tsx
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { UserMenu } from "@/components/user-menu";
import type { Profile } from "@/lib/data/types";

export function AppHeader({ user }: { user: Profile }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/events" aria-label="Festara, your events"><Wordmark className="h-5 w-auto" /></Link>
          <nav aria-label="Main">
            <Link href="/events" className="rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium">Events</Link>
          </nav>
        </div>
        <UserMenu name={user.fullName} email={user.email} />
      </div>
    </header>
  );
}
```
Create `app/(app)/layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SampleBanner } from "@/components/sample-banner";
import { getDataSource } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await (await getDataSource()).getCurrentUser();
  if (!user) redirect("/login");
  return (
    <>
      <SampleBanner />
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
    </>
  );
}
```

- [ ] **Step 3: Events home with loading, empty and error states**

Create `app/(app)/events/page.tsx`:
```tsx
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { getDataSource } from "@/lib/data";

export const metadata: Metadata = { title: "Your events" };

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const past = show === "past";
  const ds = await getDataSource();
  const user = (await ds.getCurrentUser())!;
  const today = new Date().toLocaleDateString("en-CA");
  const all = await ds.listMyEvents();
  const events = all.filter((e) => (past ? e.eventDate < today : e.eventDate >= today));
  if (past) events.reverse();

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <span className="lbl text-muted-foreground">{user.fullName}</span>
          <h1 className="font-display text-[2rem]">Your events</h1>
        </div>
        <div className="flex items-center gap-3">
          <nav aria-label="Event filter" className="inline-flex rounded-md bg-secondary p-0.5 text-sm font-medium">
            <Link href="/events" aria-current={!past ? "page" : undefined} className={`rounded-sm px-3 py-1.5 ${!past ? "bg-card" : "text-muted-foreground"}`}>Upcoming</Link>
            <Link href="/events?show=past" aria-current={past ? "page" : undefined} className={`rounded-sm px-3 py-1.5 ${past ? "bg-card" : "text-muted-foreground"}`}>Past</Link>
          </nav>
          <Button asChild><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-lg border border-dashed p-8">
          <p className="max-w-prose">
            {past ? "No past events." : "No events yet. Create one, or open an invite link someone sent you."}
          </p>
          {!past && <Button asChild variant="outline"><Link href="/events/new"><Plus className="size-4" aria-hidden />Create event</Link></Button>}
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id}><EventCard event={e} href={`/events/${e.id}`} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
```
Create `app/(app)/events/loading.tsx`:
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-8" aria-busy="true" aria-label="Loading your events">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
      </div>
    </div>
  );
}
```
Create `app/(app)/events/error.tsx`:
```tsx
"use client";

import { Button } from "@/components/ui/button";

export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="grid justify-items-start gap-3 rounded-lg border p-8">
      <h1 className="font-display text-2xl">Your events didn't load</h1>
      <p className="text-muted-foreground">Check your connection and try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

- [ ] **Step 4: The event form (create and edit)**

Create `components/event-form.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/actions/state";
import { COVER_COLORS, COVER_LABELS, EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/constants";

export type EventFormValues = {
  name: string; type: string; eventDate: string; location: string;
  totalBudget: string; description: string; coverColor: string;
};

export function EventForm({
  action, defaults, submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  defaults: EventFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const v = { ...defaults, ...(state.values ?? {}) } as EventFormValues;
  const e = state.fieldErrors ?? {};
  const bad = (k: string) => ({ "aria-invalid": !!e[k], "aria-describedby": e[k] ? `${k}-error` : undefined });

  return (
    // The key remounts the form after an error so defaults (including the select) are reapplied.
    <form key={state.values ? JSON.stringify(state.values) : "initial"} action={formAction} className="grid gap-5" noValidate>
      {state.message && !state.confirmPast && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}>
          {state.message}
        </p>
      )}

      <Field id="name" label="Event name" error={e.name}>
        <Input id="name" name="name" defaultValue={v.name} {...bad("name")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="type" label="Type" error={e.type}>
          <Select name="type" defaultValue={v.type || undefined}>
            <SelectTrigger id="type" className="w-full" {...bad("type")}><SelectValue placeholder="Choose a type" /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{EVENT_TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field id="eventDate" label="Date" error={e.eventDate}>
          <Input id="eventDate" name="eventDate" type="date" defaultValue={v.eventDate} {...bad("eventDate")} />
        </Field>
      </div>

      {state.confirmPast && (
        <label className="flex items-start gap-2 rounded-md bg-warn-tint p-3 text-sm text-warn">
          <input type="checkbox" name="confirmPast" value="yes" className="mt-1" />
          <span>{state.message}</span>
        </label>
      )}

      <Field id="location" label="Location" error={e.location}>
        <Input id="location" name="location" defaultValue={v.location} {...bad("location")} />
      </Field>

      <Field id="totalBudget" label="Total budget" error={e.totalBudget} hint="You can change this later. Budget warnings begin at 80%.">
        <div className="relative">
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
          <Input id="totalBudget" name="totalBudget" inputMode="numeric" className="pl-9 tabular-nums" defaultValue={v.totalBudget}
            aria-invalid={!!e.totalBudget} aria-describedby={e.totalBudget ? "totalBudget-error" : "totalBudget-hint"} />
        </div>
      </Field>

      <Field id="description" label="Description" error={e.description}>
        <Textarea id="description" name="description" rows={3} defaultValue={v.description} {...bad("description")} />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Cover color</legend>
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((c) => (
            <label key={c} className="relative cursor-pointer">
              <input type="radio" name="coverColor" value={c} defaultChecked={v.coverColor === c} className="peer sr-only" />
              <span aria-hidden className="block size-8 rounded-full border-2 border-card ring-1 ring-input peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                style={{ background: `var(--event-${c})` }} />
              <span className="sr-only">{COVER_LABELS[c]}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">This colors the event for everyone you invite.</p>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-fit">{pending ? "Saving" : submitLabel}</Button>
    </form>
  );
}
```

- [ ] **Step 5: Create-event page**

Create `app/(app)/events/new/page.tsx`:
```tsx
import type { Metadata } from "next";
import { EventForm } from "@/components/event-form";
import { createEventAction } from "@/lib/actions/events";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <span className="lbl text-muted-foreground">New event</span>
        <h1 className="font-display text-[2rem]">What are you planning?</h1>
      </div>
      <EventForm
        action={createEventAction}
        submitLabel="Create event"
        defaults={{ name: "", type: "", eventDate: "", location: "", totalBudget: "", description: "", coverColor: "mehndi" }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Event layout, tabs, overview and not-found**

Create `components/event-tabs.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventTabs({ eventId, showMembers, showSettings }: { eventId: string; showMembers: boolean; showSettings: boolean }) {
  const pathname = usePathname();
  const base = `/events/${eventId}`;
  const tabs = [
    { href: base, label: "Overview" },
    ...(showMembers ? [{ href: `${base}/members`, label: "Members" }] : []),
    ...(showSettings ? [{ href: `${base}/settings`, label: "Settings" }] : []),
  ];
  return (
    <nav aria-label="Event sections" className="flex gap-6 border-b">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-sm font-medium ${active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
```
Create `app/(app)/events/[id]/layout.tsx`:
```tsx
import { CalendarDays, MapPin, Shield } from "lucide-react";
import { notFound } from "next/navigation";
import { EventTabs } from "@/components/event-tabs";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { getEventCached } from "@/lib/data/queries";
import { formatEventDate } from "@/lib/date";
import { can } from "@/lib/permissions";

const ROLE_LABEL = { admin: "Admin", member: "Member", guest: "Guest" } as const;

export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role } = result.data;

  return (
    <div className="grid gap-6">
      <header
        className="flex min-h-44 flex-col justify-end gap-2.5 rounded-lg p-6 sm:p-8"
        style={{ background: `var(--event-${event.coverColor})`, color: `var(--event-${event.coverColor}-fg)` }}
      >
        <span className="lbl opacity-85">{EVENT_TYPE_LABELS[event.type]}</span>
        <h1 className="font-display text-4xl sm:text-[2.75rem]">{event.name}</h1>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />{formatEventDate(event.eventDate)}</span>
          {event.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{event.location}</span>}
          <span className="inline-flex items-center gap-1.5"><Shield className="size-4" aria-hidden />You are {ROLE_LABEL[role]}</span>
        </p>
      </header>
      <EventTabs eventId={id} showMembers={can(role, "event.viewFull")} showSettings={can(role, "event.edit")} />
      {children}
    </div>
  );
}
```
Create `app/(app)/events/[id]/page.tsx`:
```tsx
import { Link2 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getEventCached } from "@/lib/data/queries";
import { daysUntil } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t pt-3">
      <dt className="lbl text-muted-foreground">{label}</dt>
      <dd className="font-display text-[2rem] tabular-nums">{value}</dd>
    </div>
  );
}

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role, memberCount } = result.data;
  const days = daysUntil(event.eventDate);

  return (
    <div className="grid gap-8">
      {event.description && <p className="max-w-prose">{event.description}</p>}
      {can(role, "event.viewFull") ? (
        <dl className="grid gap-6 sm:grid-cols-3">
          <Fact label="Days to go" value={days > 0 ? String(days) : days === 0 ? "Today" : "Passed"} />
          <Fact label="Members" value={String(memberCount)} />
          <Fact label="Total budget" value={formatMoney(event.totalBudget)} />
        </dl>
      ) : (
        <p className="text-muted-foreground">You are a guest of this event. You can see its date, place and details.</p>
      )}
      {can(role, "invite.create") && (
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href={`/events/${id}/members`}><Link2 className="size-4" aria-hidden />Invite people</Link></Button>
          <Button asChild variant="outline"><Link href={`/events/${id}/settings`}>Edit event</Link></Button>
        </div>
      )}
    </div>
  );
}
```
Create `app/(app)/events/[id]/not-found.tsx`:
```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NO_ACCESS } from "@/lib/messages";

export default function EventNotFound() {
  return (
    <div className="grid justify-items-start gap-3 rounded-lg border p-8">
      <h1 className="font-display text-2xl">Event not found</h1>
      <p className="max-w-prose text-muted-foreground">{NO_ACCESS}</p>
      <Button asChild><Link href="/events">Back to your events</Link></Button>
    </div>
  );
}
```

- [ ] **Step 7: Settings page and the delete dialog**

Create `components/delete-event-dialog.tsx`:
```tsx
"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteEventAction } from "@/lib/actions/events";
import type { ActionState } from "@/lib/actions/state";

export function DeleteEventDialog({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [state, action, pending] = useActionState(deleteEventAction.bind(null, eventId), {} as ActionState);
  const [typed, setTyped] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-fit text-over"><Trash2 className="size-4" aria-hidden />Delete event</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Delete {eventName}?</DialogTitle>
            <DialogDescription>Members, guests and expenses go with it. This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="confirmName">Type the event name to confirm</Label>
            <Input id="confirmName" name="confirmName" autoComplete="off" value={typed} onChange={(ev) => setTyped(ev.target.value)} />
          </div>
          {state.message && <p role="alert" className="text-sm text-over">{state.message}</p>}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="ghost">Keep event</Button></DialogClose>
            <Button type="submit" variant="destructive" disabled={pending || typed.trim() !== eventName}>
              {pending ? "Deleting" : "Delete event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```
Create `app/(app)/events/[id]/settings/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { EventForm } from "@/components/event-form";
import { updateEventAction } from "@/lib/actions/events";
import { getEventCached } from "@/lib/data/queries";
import { can } from "@/lib/permissions";

export default async function EventSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEventCached(id);
  if (!result.ok) notFound();
  const { event, role } = result.data;
  if (!can(role, "event.edit")) {
    return <p className="text-muted-foreground">Only the Admin can change this event's settings.</p>;
  }
  return (
    <div className="grid max-w-xl gap-10">
      <EventForm
        action={updateEventAction.bind(null, id)}
        submitLabel="Save changes"
        defaults={{
          name: event.name, type: event.type, eventDate: event.eventDate, location: event.location ?? "",
          totalBudget: String(event.totalBudget), description: event.description ?? "", coverColor: event.coverColor,
        }}
      />
      <section aria-labelledby="danger" className="grid gap-3 border-t pt-6">
        <h2 id="danger" className="text-lg font-semibold">Delete event</h2>
        <p className="text-sm text-muted-foreground">Members, guests and expenses go with it. This can't be undone.</p>
        <DeleteEventDialog eventId={id} eventName={event.name} />
      </section>
    </div>
  );
}
```

- [ ] **Step 8: Verify by hand**

Run `npx tsc --noEmit` then `npm run dev`. Sign in as `rashid@example.com` / `festara123`.
1. `/events` lists Ayesha's Mehndi (Admin), Naran Trip (Member), NUML Tech Fest 2027 (Member), each in its cover color. "Past" shows the empty sentence.
2. Create event with a negative budget: the exact message `Budget can't be negative. Enter an amount of 0 or more.` and nothing saved (TC-05). Choose yesterday's date: a warning checkbox appears (UC-01 4b).
3. Valid create: lands on the new event, "You are Admin" (TC-04).
4. Naran Trip (Member): no Settings tab; `/events/e-naran/settings` shows the Admin-only sentence.
5. Settings on an Admin event: edit and save shows "Changes saved." Delete: the button stays disabled until the exact name is typed, then returns to `/events` (TC-11).
6. `/events/does-not-exist`: the Event not found page with the `NO_ACCESS` sentence (TC-10).

- [ ] **Step 9: Commit**

```bash
npm test
git add -A
git commit -m "feat: events home, create, overview, settings and delete on mock data"
```

---

### Task 8: Members, invite links and the invite page

Covers FR-10, FR-11, FR-12, FR-13, FR-14 (UI).

**Files:**
- Create: `lib/actions/members.ts`, `components/members-panel.tsx`, `app/(app)/events/[id]/members/page.tsx`, `app/invite/[token]/page.tsx`

**Interfaces:**
- Consumes: `getEventCached`, `can`, `daysLeft`, `initials`, `RoleBadge`, `getDataSource`.
- Produces: `createInvitationAction(eventId, role)`, `changeRoleAction(eventId, userId, role)`, `removeMemberAction(eventId, userId)`, `acceptInvitationAction(token)`; `<MembersPanel>`.

- [ ] **Step 1: Member and invitation actions**

Create `lib/actions/members.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDataSource } from "@/lib/data";
import type { Result } from "@/lib/data/result";
import type { InviteRole } from "@/lib/data/types";
import type { Role } from "@/lib/permissions";

const membersPath = (eventId: string) => `/events/${eventId}/members`;

export async function createInvitationAction(eventId: string, role: InviteRole): Promise<Result<{ token: string }>> {
  const result = await (await getDataSource()).createInvitation(eventId, role);
  if (!result.ok) return result;
  revalidatePath(membersPath(eventId));
  return { ok: true, data: { token: result.data.token } };
}

export async function changeRoleAction(eventId: string, userId: string, role: Role): Promise<Result<null>> {
  const result = await (await getDataSource()).changeRole(eventId, userId, role);
  if (result.ok) revalidatePath(membersPath(eventId));
  return result;
}

export async function removeMemberAction(eventId: string, userId: string): Promise<Result<null>> {
  const result = await (await getDataSource()).removeMember(eventId, userId);
  if (result.ok) revalidatePath(membersPath(eventId));
  return result;
}

/** Used by the invite page. Success goes to the event; any failure goes back to the invite page to explain. */
export async function acceptInvitationAction(token: string): Promise<void> {
  const result = await (await getDataSource()).acceptInvitation(token);
  if (result.ok) {
    revalidatePath("/events");
    redirect(`/events/${result.data.eventId}`);
  }
  redirect(result.code === "auth" ? `/login?next=${encodeURIComponent(`/invite/${token}`)}` : `/invite/${token}`);
}
```

- [ ] **Step 2: The members panel**

Create `components/members-panel.tsx`:
```tsx
"use client";

import { Copy, Link2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RoleBadge } from "@/components/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { changeRoleAction, createInvitationAction, removeMemberAction } from "@/lib/actions/members";
import type { InviteRole, Member } from "@/lib/data/types";
import type { Role } from "@/lib/permissions";
import { initials } from "@/lib/text";

export type InviteView = { id: string; token: string; role: InviteRole; daysLeft: number };

export function MembersPanel({
  eventId, eventName, currentUserId, members, invites, canManage,
}: {
  eventId: string; eventName: string; currentUserId: string;
  members: Member[]; invites: InviteView[]; canManage: boolean;
}) {
  const [pending, start] = useTransition();
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [removing, setRemoving] = useState<Member | null>(null);

  function createLink() {
    start(async () => {
      const r = await createInvitationAction(eventId, inviteRole);
      if (r.ok) toast.success("Invite link created"); else toast.error(r.message);
    });
  }
  async function copy(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    try { await navigator.clipboard.writeText(url); toast.success("Invite link copied"); }
    catch { toast.error("Couldn't copy. Select the link and copy it by hand."); }
  }
  function changeRole(userId: string, role: Role) {
    start(async () => {
      const r = await changeRoleAction(eventId, userId, role);
      if (r.ok) toast.success("Role updated"); else toast.error(r.message);
    });
  }
  function confirmRemove() {
    if (!removing) return;
    const target = removing;
    start(async () => {
      const r = await removeMemberAction(eventId, target.userId);
      if (r.ok) toast.success(`${target.fullName} was removed`); else toast.error(r.message);
      setRemoving(null);
    });
  }

  return (
    <div className="grid max-w-3xl gap-10">
      {canManage && (
        <section aria-labelledby="invite-h" className="grid gap-3">
          <h2 id="invite-h" className="text-lg font-semibold">Invite link</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as InviteRole)}>
              <SelectTrigger aria-label="Role for this link" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">As Member</SelectItem>
                <SelectItem value="guest">As Guest</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createLink} disabled={pending}><Link2 className="size-4" aria-hidden />Create invite link</Button>
          </div>
          <p className="text-xs text-muted-foreground">Anyone with a link joins with the role you pick. It stops working after 7 days.</p>
          {invites.length > 0 && (
            <ul className="grid gap-2">
              {invites.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-md border bg-card px-3 py-2.5 font-mono text-sm text-muted-foreground">/invite/{i.token}</code>
                  <RoleBadge role={i.role} />
                  <span className="hidden text-xs text-muted-foreground sm:inline">{i.daysLeft} {i.daysLeft === 1 ? "day" : "days"} left</span>
                  <Button variant="outline" onClick={() => copy(i.token)}><Copy className="size-4" aria-hidden />Copy link</Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="people-h" className="grid gap-1">
        <h2 id="people-h" className="text-lg font-semibold">{members.length} {members.length === 1 ? "person" : "people"}</h2>
        <ul>
          {members.map((m) => (
            <li key={m.userId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_9rem_2.5rem]">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-8"><AvatarFallback className="bg-secondary text-xs font-semibold">{initials(m.fullName)}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.fullName}{m.userId === currentUserId && <span className="font-normal text-muted-foreground"> (you)</span>}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>
              {canManage ? (
                <>
                  <Select value={m.role} onValueChange={(v) => changeRole(m.userId, v as Role)} disabled={pending}>
                    <SelectTrigger aria-label={`Role for ${m.fullName}`} className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" aria-label={`Remove ${m.fullName}`} onClick={() => setRemoving(m)} className="justify-self-end max-sm:col-start-2">
                    <X className="size-4" aria-hidden />
                  </Button>
                </>
              ) : (
                <RoleBadge role={m.role} className="justify-self-end sm:col-span-2" />
              )}
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Remove {removing?.fullName}?</DialogTitle>
            <DialogDescription>They lose access to {eventName}. You can invite them again later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Keep them</Button></DialogClose>
            <Button variant="destructive" onClick={confirmRemove} disabled={pending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 3: Members page**

Create `app/(app)/events/[id]/members/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { MembersPanel } from "@/components/members-panel";
import { getDataSource } from "@/lib/data";
import { getEventCached } from "@/lib/data/queries";
import { daysLeft } from "@/lib/date";
import { can } from "@/lib/permissions";

export default async function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getEventCached(id);
  if (!detail.ok) notFound();
  const ds = await getDataSource();
  const me = (await ds.getCurrentUser())!;
  const members = await ds.listMembers(id);
  if (!members.ok) return <p className="text-muted-foreground">{members.message}</p>;

  const canManage = can(detail.data.role, "member.manage");
  const invites = canManage ? await ds.listInvitations(id) : null;

  return (
    <MembersPanel
      eventId={id}
      eventName={detail.data.event.name}
      currentUserId={me.id}
      members={members.data}
      canManage={canManage}
      invites={(invites && invites.ok ? invites.data : []).map((i) => ({ id: i.id, token: i.token, role: i.role, daysLeft: daysLeft(i.expiresAt) }))}
    />
  );
}
```

- [ ] **Step 4: The invite page (public, mobile first)**

Create `app/invite/[token]/page.tsx`:
```tsx
import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SampleBanner } from "@/components/sample-banner";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/lib/actions/members";
import { getDataSource } from "@/lib/data";
import { formatEventDate } from "@/lib/date";

export const metadata: Metadata = { title: "You're invited" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ds = await getDataSource();
  const [user, preview] = await Promise.all([ds.getCurrentUser(), ds.getInvitationPreview(token)]);
  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <>
      <SampleBanner />
      <main className="mx-auto grid w-full max-w-md gap-6 px-4 py-8">
        <Link href="/" aria-label="Festara home" className="justify-self-start"><Wordmark className="h-6 w-auto" /></Link>

        {!preview.ok ? (
          <section className="grid gap-4 rounded-lg border bg-card p-6">
            <span className="lbl text-muted-foreground">Invite link</span>
            <h1 className="font-display text-[1.75rem]">This link has expired</h1>
            <p className="text-lg">{preview.message} Ask the person who invited you to send a new one.</p>
            <Button asChild variant="outline" size="lg"><Link href="/login">Go to sign in</Link></Button>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border bg-card">
            <div className="flex min-h-48 flex-col justify-end gap-2 p-6"
              style={{ background: `var(--event-${preview.data.coverColor})`, color: `var(--event-${preview.data.coverColor}-fg)` }}>
              <span className="lbl opacity-85">You're invited</span>
              <h1 className="font-display text-[2rem]">{preview.data.eventName}</h1>
            </div>
            <div className="grid gap-5 p-6">
              <p className="text-lg">
                <strong>{preview.data.inviterName}</strong> invited you to join as a <strong>{preview.data.role === "guest" ? "Guest" : "Member"}</strong>.
              </p>
              <ul className="grid gap-3 text-base">
                <li className="flex items-start gap-3"><CalendarDays className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{formatEventDate(preview.data.eventDate)}</li>
                {preview.data.location && <li className="flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />{preview.data.location}</li>}
              </ul>
              {user ? (
                <form action={acceptInvitationAction.bind(null, token)}>
                  <Button type="submit" size="lg" className="h-13 w-full">Join {preview.data.eventName}</Button>
                </form>
              ) : (
                <div className="grid gap-3">
                  <Button asChild size="lg" className="h-13 w-full"><Link href={`/register?next=${next}`}>Join {preview.data.eventName}</Link></Button>
                  <Button asChild variant="ghost" size="lg"><Link href={`/login?next=${next}`}>I already have an account</Link></Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {preview.data.role === "guest" ? "As a guest you can see the event details." : "As a member you can see everything about the event and add to it."}
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
```
(`h-13` is a valid Tailwind v4 spacing value, 52 px.)

- [ ] **Step 5: Verify by hand (TC-07, TC-08, TC-09, TC-14)**

Run `npm run dev`. Sign in as `rashid@example.com` / `festara123`.
1. Open Ayesha's Mehndi, Members tab. Create a Member link. It appears with "7 days left"; Copy link shows "Invite link copied".
2. Open the copied `/invite/<token>` in a private window (signed out): the event preview shows. Choose Join, register a new account, and you land on the event with "You are Member" (TC-07).
3. Back as Rashid: the new person is listed as Member. Change them to Guest, then remove them (confirm dialog). They disappear from `/events` for that account (TC-14).
4. Try to change Rashid (the only Admin) to Member: toast shows `Every event needs at least one Admin. Make someone else Admin first.` (TC-09).
5. Open `/invite/not-a-real-token`: "This link has expired" with `This invite link is invalid or has expired.` (TC-08).
6. Sign in as `tariq@example.com` (Guest on Ayesha's Mehndi): no Members or Settings tab; `/events/e-mehndi/members` shows the "don't have access to the member list" sentence.

- [ ] **Step 6: Commit**

```bash
npm test
git add -A
git commit -m "feat: members, role changes, invite links and invite page on mock data"
```

---

### Task 9: Profile page, polish and the prototype checkpoint

Covers FR-04 and the quality bar for every screen.

**Files:**
- Create: `lib/actions/profile.ts`, `components/profile-form.tsx`, `app/(app)/profile/page.tsx`

**Interfaces:**
- Consumes: `profileSchema`, `Field`, `getDataSource`.
- Produces: `updateProfileAction`; the checked prototype.

- [ ] **Step 1: Profile action, form and page**

Create `lib/actions/profile.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { getDataSource } from "@/lib/data";
import { formDataToObject, parseForm } from "@/lib/validation/common";
import { profileSchema } from "@/lib/validation/profile";
import type { ActionState } from "./state";

export async function updateProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const raw = formDataToObject(fd);
  const parsed = parseForm(profileSchema, raw);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors, values: raw };
  const result = await (await getDataSource()).updateProfile(parsed.data);
  if (!result.ok) return { message: result.message, values: raw };
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved.", values: { fullName: result.data.fullName, phone: result.data.phone ?? "" } };
}
```
Create `components/profile-form.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/actions/state";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, {} as ActionState);
  const v = { fullName, phone, ...(state.values ?? {}) };
  const e = state.fieldErrors ?? {};
  return (
    <form key={state.values ? JSON.stringify(state.values) : "initial"} action={action} className="grid gap-5" noValidate>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-md p-3 text-sm ${state.ok ? "bg-ok-tint text-ok" : "bg-over-tint text-over"}`}>{state.message}</p>
      )}
      <Field id="fullName" label="Full name" error={e.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} aria-invalid={!!e.fullName} aria-describedby={e.fullName ? "fullName-error" : undefined} />
      </Field>
      <Field id="phone" label="Phone number" error={e.phone} hint="Optional. Members of your events can see it.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} aria-invalid={!!e.phone} aria-describedby={e.phone ? "phone-error" : "phone-hint"} />
      </Field>
      <Field id="email" label="Email" hint="Your email can't be changed here.">
        <Input id="email" value={email} disabled readOnly aria-describedby="email-hint" />
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="w-fit">{pending ? "Saving" : "Save profile"}</Button>
    </form>
  );
}
```
Create `app/(app)/profile/page.tsx`:
```tsx
import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { getDataSource } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = (await (await getDataSource()).getCurrentUser())!;
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <span className="lbl text-muted-foreground">Profile</span>
        <h1 className="font-display text-[2rem]">Your details</h1>
      </div>
      <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
    </div>
  );
}
```

- [ ] **Step 2: Quality pass against the brand checklist**

For every screen, check and fix:
1. **Tokens only.** Run `grep -rnE "#[0-9a-fA-F]{3,8}\b|bg-(red|green|blue|yellow|purple|indigo|slate|gray|zinc|neutral|stone|orange|amber)-[0-9]" app components lib --include=*.tsx --include=*.ts --include=*.css | grep -v "components/brand/wordmark.tsx" | grep -v "components/ui/"`. Expected: no output. Fix any hit by using a token class.
2. **Money** appears only through `formatMoney`. `grep -rn "Rs " app components` must show only labels or the budget input prefix.
3. **States.** Each screen has its loading, empty and error state from spec section 8. Add `loading.tsx` or `error.tsx` where one is missing.
4. **Width.** In the browser dev tools set 360 px, 768 px, 1280 px and 1920 px. No horizontal scrollbar on any screen. Fix overflowing rows with `min-w-0` and `truncate`.
5. **Keyboard.** Tab through login, create event, members and the invite page. Every control reachable, focus ring visible, dialogs trap and restore focus, Escape closes dialogs.
6. **Dark mode.** Set `data-theme="dark"` on `<html>` in dev tools; text stays readable and covers keep their colors.
7. **Reduced motion.** Enable "prefers-reduced-motion" in dev tools rendering; the press scale does not animate.
8. **Copy.** Search for `!`, "Oops" and "Success" in user-facing strings: `grep -rnE "Oops|Success|!\"" app components lib/actions lib/messages.ts`. Remove any hit.

- [ ] **Step 3: Type, lint, build, test**

Run:
```bash
npx tsc --noEmit
npm run lint
npm run build
npm test
```
Expected: all four succeed. Fix anything they report.

- [ ] **Step 4: Commit and deploy the prototype**

```bash
git add -A
git commit -m "feat: profile page and quality pass for the 40% screens"
```
Push to GitHub; Vercel deploys with `DATA_SOURCE=mock`.

**CHECKPOINT: prototype demo.** Everything the supervisor can click is now present on sample data: sign in, register, reset flow, events, create and edit, delete, members and roles, invite links, the invite page and profile. Label it a prototype on sample data (the banner already says so). The report must not call these features Completed until Task 12 passes.

---

### Task 10: Database schema, functions and function tests

Covers the data model (spec section 6) and the logic behind FR-06, FR-10, FR-11, FR-12, FR-13.

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_functions.sql`, `supabase/tests/helpers.ts`, `supabase/tests/functions.test.ts`, `.env.test.example`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Produces (database): tables `profiles`, `events`, `event_members`, `invitations`, `guests`, `expenses`, `tasks`, `activity_log`; enums; functions `has_role(eid, r)`, `is_member(eid)`, `shares_event_with(uid)`, `create_event_with_admin(p_name, p_type, p_date, p_location, p_description, p_budget, p_cover)`, `accept_invitation(p_token)`, `invitation_preview(p_token)`; triggers `handle_new_user`, `guard_last_admin`, `guard_task_update`, `touch_updated_at`.
- Produces (tests): `supabase/tests/helpers.ts` exports `hasEnv`, `admin()`, `anonClient()`, `makeUser(label)`, `cleanup({ eventIds, userIds })`, type `TestUser`.
- Error contract: database exceptions use `errcode P0001` with these messages: `invalid_invite`, `last_admin`, `not_signed_in`, `only_status`.

- [ ] **Step 1: Create the Supabase test project and keys (needs your account)**

In https://supabase.com/dashboard create a project named `festara-test` (free tier is fine; this is the separate test project the report promises). From Project Settings, copy the project URL, the publishable key, and the service role key (the service key never goes in the app, tests only).

Create `.env.test.example`:
```
SUPABASE_TEST_URL=
SUPABASE_TEST_PUBLISHABLE_KEY=
SUPABASE_TEST_SERVICE_ROLE_KEY=
```
Copy it to `.env.test` and fill in the values. Add `.env.test` to `.gitignore` if it is not already ignored by `.env*`.

Install the Supabase CLI and link:
```bash
npm install -D supabase
npx supabase init
npx supabase login
npx supabase link --project-ref <your-project-ref>
```
Expected: `supabase/` folder with `config.toml`; `link` succeeds.

In `package.json` add the script:
```json
"test:db": "node --env-file=.env.test ./node_modules/vitest/vitest.mjs run supabase/tests"
```

- [ ] **Step 2: Test helpers**

Create `supabase/tests/helpers.ts`:
```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const env = {
  url: process.env.SUPABASE_TEST_URL,
  key: process.env.SUPABASE_TEST_PUBLISHABLE_KEY,
  service: process.env.SUPABASE_TEST_SERVICE_ROLE_KEY,
};
export const hasEnv = Boolean(env.url && env.key && env.service);

export const admin = () => createClient(env.url!, env.service!, { auth: { persistSession: false, autoRefreshToken: false } });
export const anonClient = () => createClient(env.url!, env.key!, { auth: { persistSession: false, autoRefreshToken: false } });

export type TestUser = { id: string; email: string; client: SupabaseClient };

/** Creates a confirmed user with the service key and returns a client signed in as that user. */
export async function makeUser(label: string): Promise<TestUser> {
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@festara.test`;
  const password = "festara-test-123";
  const { data, error } = await admin().auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: label },
  });
  if (error) throw error;
  const client = anonClient();
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  return { id: data.user!.id, email, client };
}

/** Deletes events first (cascades members and invitations), then users. */
export async function cleanup({ eventIds = [], userIds = [] }: { eventIds?: string[]; userIds?: string[] }) {
  const a = admin();
  for (const id of eventIds) await a.from("events").delete().eq("id", id);
  for (const id of userIds) await a.auth.admin.deleteUser(id);
}
```

- [ ] **Step 3: Write the failing function tests**

Create `supabase/tests/functions.test.ts`:
```ts
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { admin, anonClient, cleanup, hasEnv, makeUser, type TestUser } from "./helpers";

vi.setConfig({ testTimeout: 30_000, hookTimeout: 60_000 });

const newEvent = (name = "Ayesha's Mehndi") => ({
  p_name: name, p_type: "mehndi", p_date: "2026-12-14", p_location: "Lahore",
  p_description: null, p_budget: 500000, p_cover: "mehndi",
});

describe.skipIf(!hasEnv)("database functions", () => {
  let A: TestUser, B: TestUser, D: TestUser;
  const eventIds: string[] = [];

  beforeAll(async () => {
    [A, B, D] = await Promise.all([makeUser("admin"), makeUser("member"), makeUser("outsider")]);
  });
  afterAll(() => cleanup({ eventIds, userIds: [A?.id, B?.id, D?.id].filter(Boolean) }));

  async function eventWithMember() {
    const created = await A.client.rpc("create_event_with_admin", newEvent());
    expect(created.error).toBeNull();
    const id = created.data.id as string;
    eventIds.push(id);
    const token = `tok-${Math.random().toString(36).slice(2)}`;
    const inv = await A.client.from("invitations").insert({ event_id: id, token, role: "member", created_by: A.id });
    expect(inv.error).toBeNull();
    return { id, token };
  }

  it("creates a profile row when a user signs up", async () => {
    const { data } = await admin().from("profiles").select("*").eq("id", A.id).single();
    expect(data?.full_name).toBe("admin");
    expect(data?.email).toBe(A.email);
  });

  it("create_event_with_admin makes the caller Admin in one step (FR-06)", async () => {
    const created = await A.client.rpc("create_event_with_admin", newEvent());
    expect(created.error).toBeNull();
    eventIds.push(created.data.id);
    const members = await admin().from("event_members").select("user_id, role").eq("event_id", created.data.id);
    expect(members.data).toEqual([{ user_id: A.id, role: "admin" }]);
    expect(created.data.cover_color).toBe("mehndi");
  });

  it("rejects a negative budget at the database", async () => {
    const r = await A.client.rpc("create_event_with_admin", { ...newEvent(), p_budget: -1 });
    expect(r.error).not.toBeNull();
  });

  it("accept_invitation adds the user with the link's role and counts the use (FR-11)", async () => {
    const { id, token } = await eventWithMember();
    const r = await B.client.rpc("accept_invitation", { p_token: token });
    expect(r.error).toBeNull();
    expect(r.data).toBe(id);
    const m = await admin().from("event_members").select("role").eq("event_id", id).eq("user_id", B.id).single();
    expect(m.data?.role).toBe("member");
    const inv = await admin().from("invitations").select("used_count").eq("token", token).single();
    expect(inv.data?.used_count).toBe(1);
  });

  it("keeps the existing role when a member opens a link again (UC-02 4a)", async () => {
    const { id, token } = await eventWithMember();
    await B.client.rpc("accept_invitation", { p_token: token });
    const again = await A.client.rpc("accept_invitation", { p_token: token }); // A is already Admin
    expect(again.error).toBeNull();
    const m = await admin().from("event_members").select("role").eq("event_id", id).eq("user_id", A.id).single();
    expect(m.data?.role).toBe("admin");
    const inv = await admin().from("invitations").select("used_count").eq("token", token).single();
    expect(inv.data?.used_count).toBe(1);
  });

  it("rejects unknown and expired links (FR-12)", async () => {
    const { id } = await eventWithMember();
    await admin().from("invitations").insert({
      event_id: id, token: "expired-token-1", role: "member", created_by: A.id,
      expires_at: new Date(Date.now() - 86_400_000).toISOString(),
    });
    const unknown = await D.client.rpc("accept_invitation", { p_token: "no-such-token" });
    expect(unknown.error?.message).toBe("invalid_invite");
    const expired = await D.client.rpc("accept_invitation", { p_token: "expired-token-1" });
    expect(expired.error?.message).toBe("invalid_invite");
  });

  it("invitation_preview works without signing in and hides expired links", async () => {
    const { token } = await eventWithMember();
    const ok = await anonClient().rpc("invitation_preview", { p_token: token });
    expect(ok.error).toBeNull();
    expect(ok.data).toHaveLength(1);
    expect(ok.data[0].event_name).toBe("Ayesha's Mehndi");
    expect(ok.data[0].role).toBe("member");
    const none = await anonClient().rpc("invitation_preview", { p_token: "nope" });
    expect(none.data).toEqual([]);
  });

  it("blocks demoting or removing the last Admin (TC-09)", async () => {
    const { id } = await eventWithMember();
    const demote = await A.client.from("event_members").update({ role: "member" }).eq("event_id", id).eq("user_id", A.id).select();
    expect(demote.error?.message).toBe("last_admin");
    const remove = await A.client.from("event_members").delete().eq("event_id", id).eq("user_id", A.id).select();
    expect(remove.error?.message).toBe("last_admin");
  });

  it("lets the Admin delete the whole event even though it has an Admin member (TC-11)", async () => {
    const { id } = await eventWithMember();
    const del = await A.client.from("events").delete().eq("id", id).select();
    expect(del.error).toBeNull();
    expect(del.data).toHaveLength(1);
    const left = await admin().from("event_members").select("id").eq("event_id", id);
    expect(left.data).toEqual([]);
  });
});
```
(Row level security is not enabled until Task 11, so a signed-in user can insert into `invitations` directly and these tests can pass in Task 10. After Task 11 they must keep passing, because the policies allow the Admin to do exactly this.)

- [ ] **Step 4: Run and watch it fail**

Run: `npm run test:db`
Expected: FAIL, errors about missing tables or functions (the schema is not pushed yet).

- [ ] **Step 5: Write the schema migration**

Create `supabase/migrations/0001_schema.sql`:
```sql
-- Festara schema: report Appendix I, plus events.cover_color and profiles.email (see spec section 11).
-- Row level security is enabled in 0003_rls.sql.

create type public.event_type as enum (
  'wedding', 'engagement', 'mehndi', 'walima', 'birthday', 'eid_gathering', 'trip', 'university_event', 'other'
);
create type public.member_role as enum ('admin', 'member', 'guest');
create type public.rsvp_status as enum ('pending', 'confirmed', 'declined');
create type public.expense_category as enum ('venue', 'catering', 'decor', 'transport', 'photography', 'misc');
create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null default '',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  type public.event_type not null,
  event_date date not null,
  location text,
  description text,
  total_budget numeric(12, 2) not null default 0 check (total_budget >= 0),
  cover_color text not null default 'mehndi'
    check (cover_color in ('mehndi', 'marigold', 'sindoor', 'kahwa', 'sky', 'night')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null,
  joined_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index event_members_user_idx on public.event_members (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  token text not null unique,
  role public.member_role not null check (role in ('member', 'guest')),
  created_by uuid not null references public.profiles (id),
  expires_at timestamptz not null default now() + interval '7 days',
  used_count integer not null default 0
);
create index invitations_event_idx on public.invitations (event_id);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  phone text,
  family_side text,
  rsvp_status public.rsvp_status not null default 'pending',
  added_by uuid not null references public.profiles (id)
);
create index guests_event_idx on public.guests (event_id);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  paid_by uuid not null references public.profiles (id),
  amount numeric(12, 2) not null check (amount > 0),
  category public.expense_category not null,
  description text,
  expense_date date not null
);
create index expenses_event_idx on public.expenses (event_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  assigned_to uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  deadline date,
  status public.task_status not null default 'todo'
);
create index tasks_event_idx on public.tasks (event_id);

create table public.activity_log (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.events (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index activity_log_event_idx on public.activity_log (event_id);
```

- [ ] **Step 6: Write the functions and triggers migration**

Create `supabase/migrations/0002_functions.sql`:
```sql
-- Helpers used by RLS policies. security definer avoids recursion on event_members.
create or replace function public.has_role(eid uuid, r public.member_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.event_members
    where event_id = eid and user_id = auth.uid() and (role = r or role = 'admin')
  );
$$;

create or replace function public.is_member(eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_members where event_id = eid and user_id = auth.uid());
$$;

create or replace function public.shares_event_with(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.event_members mine
    join public.event_members theirs on theirs.event_id = mine.event_id
    where mine.user_id = auth.uid() and theirs.user_id = uid
  );
$$;

-- Keep events.updated_at current.
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

-- A profile row appears when a user signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Creates an event and makes the caller its Admin in one transaction (FR-05, FR-06).
create or replace function public.create_event_with_admin(
  p_name text, p_type public.event_type, p_date date, p_location text,
  p_description text, p_budget numeric, p_cover text
) returns public.events language plpgsql security definer set search_path = public as $$
declare ev public.events;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = 'P0001'; end if;
  insert into public.events (name, type, event_date, location, description, total_budget, cover_color, created_by)
  values (p_name, p_type, p_date, p_location, p_description, p_budget, coalesce(p_cover, 'mehndi'), auth.uid())
  returning * into ev;
  insert into public.event_members (event_id, user_id, role) values (ev.id, auth.uid(), 'admin');
  return ev;
end $$;

-- Joins the caller to an event through an invite link (FR-11, FR-12).
create or replace function public.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv public.invitations; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in' using errcode = 'P0001'; end if;
  select * into inv from public.invitations where token = p_token for update;
  if not found or inv.expires_at < now() then
    raise exception 'invalid_invite' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.event_members where event_id = inv.event_id and user_id = uid) then
    return inv.event_id; -- already a member: keep the current role
  end if;
  insert into public.event_members (event_id, user_id, role) values (inv.event_id, uid, inv.role);
  update public.invitations set used_count = used_count + 1 where id = inv.id;
  return inv.event_id;
end $$;

-- Lets the invite page show the event before sign-in. Returns nothing for unknown or expired tokens.
create or replace function public.invitation_preview(p_token text)
returns table (event_name text, event_date date, location text, cover_color text, inviter_name text, role public.member_role)
language sql stable security definer set search_path = public as $$
  select e.name, e.event_date, e.location, e.cover_color,
         coalesce(p.full_name, 'The organiser'), i.role
  from public.invitations i
  join public.events e on e.id = i.event_id
  left join public.profiles p on p.id = i.created_by
  where i.token = p_token and i.expires_at > now();
$$;

-- Every event keeps at least one Admin (FR-13). Cascades from deleting the event are allowed.
create or replace function public.guard_last_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin') then
    if exists (select 1 from public.events where id = old.event_id)
       and not exists (
         select 1 from public.event_members
         where event_id = old.event_id and role = 'admin' and id <> old.id
       ) then
      raise exception 'last_admin' using errcode = 'P0001';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
create trigger event_members_guard before update of role or delete on public.event_members
  for each row execute function public.guard_last_admin();

-- A non-Admin assignee may change only a task's status (planned Tasks module).
create or replace function public.guard_task_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(old.event_id, 'admin') and (
       new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.deadline is distinct from old.deadline
    or new.assigned_to is distinct from old.assigned_to
    or new.event_id is distinct from old.event_id
  ) then
    raise exception 'only_status' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger tasks_guard before update on public.tasks
  for each row execute function public.guard_task_update();

-- Who may call what.
revoke execute on function public.create_event_with_admin(text, public.event_type, date, text, text, numeric, text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
grant execute on function public.create_event_with_admin(text, public.event_type, date, text, text, numeric, text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.invitation_preview(text) to anon, authenticated;
```
If the delete-event test fails with `last_admin`, the cascade case in `guard_last_admin` is not being recognised. Replace the `exists (select 1 from public.events ...)` condition with `pg_trigger_depth() = 1` and re-run (a direct delete is depth 1, a cascade from `events` is deeper).

- [ ] **Step 7: Push the migrations**

Run:
```bash
npx supabase db push
```
Expected: applies `0001_schema.sql` and `0002_functions.sql` to the linked project with no errors.

- [ ] **Step 8: Run the function tests**

Run: `npm run test:db -- supabase/tests/functions.test.ts`
Expected: all 8 tests pass. If "lets the Admin delete the whole event" fails with `last_admin`, apply the `pg_trigger_depth()` fallback described in Step 6 and re-run.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: database schema, functions and triggers with function tests"
```

---

### Task 11: Row level security and the policy script

Covers FR-14 and the security NFR (RLS on 100% of tables, zero rows leaked to non-members).

**Files:**
- Create: `supabase/migrations/0003_rls.sql`, `supabase/tests/rls.test.ts`

**Interfaces:**
- Consumes: Task 10 helpers and functions.
- Produces: RLS policies exactly matching `lib/permissions.ts` (report Table 5.2).

- [ ] **Step 1: Write the failing policy test**

Create `supabase/tests/rls.test.ts`:
```ts
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { admin, anonClient, cleanup, hasEnv, makeUser, type TestUser } from "./helpers";

vi.setConfig({ testTimeout: 30_000, hookTimeout: 90_000 });

describe.skipIf(!hasEnv)("row level security (report Table 5.2)", () => {
  let A: TestUser, B: TestUser, G: TestUser, D: TestUser; // admin, member, guest, outsider
  let eventId = "";
  const eventIds: string[] = [];

  beforeAll(async () => {
    [A, B, G, D] = await Promise.all([makeUser("admin"), makeUser("member"), makeUser("guest"), makeUser("outsider")]);
    const created = await A.client.rpc("create_event_with_admin", {
      p_name: "RLS Event", p_type: "wedding", p_date: "2026-12-14", p_location: "Lahore",
      p_description: null, p_budget: 100000, p_cover: "sindoor",
    });
    if (created.error) throw created.error;
    eventId = created.data.id;
    eventIds.push(eventId);
    for (const [user, role] of [[B, "member"], [G, "guest"]] as const) {
      const token = `rls-${role}-${Math.random().toString(36).slice(2)}`;
      const inv = await A.client.from("invitations").insert({ event_id: eventId, token, role, created_by: A.id });
      if (inv.error) throw inv.error;
      const joined = await user.client.rpc("accept_invitation", { p_token: token });
      if (joined.error) throw joined.error;
    }
  });
  afterAll(() => cleanup({ eventIds, userIds: [A?.id, B?.id, G?.id, D?.id].filter(Boolean) }));

  describe("events", () => {
    it("a non-member reads zero rows (TC-10)", async () => {
      expect((await D.client.from("events").select("id").eq("id", eventId)).data).toEqual([]);
    });
    it("signed-out visitors read nothing", async () => {
      expect((await anonClient().from("events").select("id")).data ?? []).toEqual([]);
    });
    it("Admin, Member and Guest can read the event", async () => {
      for (const u of [A, B, G]) {
        expect((await u.client.from("events").select("id").eq("id", eventId)).data).toHaveLength(1);
      }
    });
    it("only the Admin can update (TC-06)", async () => {
      for (const u of [B, G, D]) {
        const r = await u.client.from("events").update({ name: "Hacked" }).eq("id", eventId).select();
        expect(r.data ?? []).toEqual([]);
      }
      const ok = await A.client.from("events").update({ name: "RLS Event 2" }).eq("id", eventId).select();
      expect(ok.data).toHaveLength(1);
      const stored = await admin().from("events").select("name").eq("id", eventId).single();
      expect(stored.data?.name).toBe("RLS Event 2");
    });
    it("nobody can insert an event directly", async () => {
      const r = await A.client.from("events").insert({ name: "Direct", type: "other", event_date: "2026-12-14", created_by: A.id });
      expect(r.error).not.toBeNull();
    });
  });

  describe("event_members", () => {
    it("members see co-members, outsiders see none", async () => {
      expect((await B.client.from("event_members").select("id").eq("event_id", eventId)).data).toHaveLength(3);
      expect((await D.client.from("event_members").select("id").eq("event_id", eventId)).data).toEqual([]);
    });
    it("only the Admin changes roles", async () => {
      const denied = await B.client.from("event_members").update({ role: "admin" }).eq("event_id", eventId).eq("user_id", G.id).select();
      expect(denied.data ?? []).toEqual([]);
      const ok = await A.client.from("event_members").update({ role: "member" }).eq("event_id", eventId).eq("user_id", G.id).select();
      expect(ok.data).toHaveLength(1);
      await A.client.from("event_members").update({ role: "guest" }).eq("event_id", eventId).eq("user_id", G.id);
    });
    it("only the Admin removes people, and nobody inserts directly", async () => {
      const denied = await B.client.from("event_members").delete().eq("event_id", eventId).eq("user_id", G.id).select();
      expect(denied.data ?? []).toEqual([]);
      const insert = await D.client.from("event_members").insert({ event_id: eventId, user_id: D.id, role: "admin" });
      expect(insert.error).not.toBeNull();
    });
  });

  describe("invitations", () => {
    it("only the Admin can read or create links", async () => {
      expect((await A.client.from("invitations").select("id").eq("event_id", eventId)).data!.length).toBeGreaterThanOrEqual(2);
      for (const u of [B, G, D]) {
        expect((await u.client.from("invitations").select("id").eq("event_id", eventId)).data ?? []).toEqual([]);
        const r = await u.client.from("invitations").insert({ event_id: eventId, token: `x-${Math.random()}`, role: "member", created_by: u.id });
        expect(r.error).not.toBeNull();
      }
    });
  });

  describe("profiles", () => {
    it("co-members see each other, outsiders do not", async () => {
      expect((await B.client.from("profiles").select("id").eq("id", A.id)).data).toHaveLength(1);
      expect((await D.client.from("profiles").select("id").eq("id", A.id)).data ?? []).toEqual([]);
    });
    it("a user edits only their own profile", async () => {
      const other = await B.client.from("profiles").update({ full_name: "Hacked" }).eq("id", A.id).select();
      expect(other.data ?? []).toEqual([]);
      const own = await B.client.from("profiles").update({ phone: "0300 1234567" }).eq("id", B.id).select();
      expect(own.data).toHaveLength(1);
    });
  });

  describe("guests (planned module, policies in place)", () => {
    it("Admin and Member add and read; Guest and outsider cannot", async () => {
      const add = await B.client.from("guests").insert({ event_id: eventId, name: "Aunt Nusrat", added_by: B.id }).select();
      expect(add.data).toHaveLength(1);
      expect((await A.client.from("guests").select("id").eq("event_id", eventId)).data!.length).toBeGreaterThanOrEqual(1);
      for (const u of [G, D]) {
        expect((await u.client.from("guests").select("id").eq("event_id", eventId)).data ?? []).toEqual([]);
        const r = await u.client.from("guests").insert({ event_id: eventId, name: "X", added_by: u.id });
        expect(r.error).not.toBeNull();
      }
    });
  });

  describe("expenses (planned module, policies in place)", () => {
    it("Member logs only as themselves; Guest cannot", async () => {
      const own = await B.client.from("expenses").insert({ event_id: eventId, paid_by: B.id, amount: 5000, category: "venue", expense_date: "2026-11-01" }).select();
      expect(own.data).toHaveLength(1);
      const forged = await B.client.from("expenses").insert({ event_id: eventId, paid_by: A.id, amount: 5000, category: "venue", expense_date: "2026-11-01" });
      expect(forged.error).not.toBeNull();
      const guest = await G.client.from("expenses").insert({ event_id: eventId, paid_by: G.id, amount: 1, category: "misc", expense_date: "2026-11-01" });
      expect(guest.error).not.toBeNull();
    });
  });

  describe("tasks (planned module, policies in place)", () => {
    it("Admin creates; assignee changes only the status", async () => {
      const denied = await B.client.from("tasks").insert({ event_id: eventId, title: "Book venue" });
      expect(denied.error).not.toBeNull();
      const made = await A.client.from("tasks").insert({ event_id: eventId, title: "Book venue", assigned_to: B.id }).select().single();
      expect(made.error).toBeNull();
      const status = await B.client.from("tasks").update({ status: "in_progress" }).eq("id", made.data!.id).select();
      expect(status.data).toHaveLength(1);
      const title = await B.client.from("tasks").update({ title: "Changed" }).eq("id", made.data!.id).select();
      expect(title.error?.message).toBe("only_status");
    });
  });

  describe("activity_log (planned module, policies in place)", () => {
    it("only the Admin reads, nobody inserts directly", async () => {
      await admin().from("activity_log").insert({ event_id: eventId, actor_id: A.id, action: "insert", entity_type: "event" });
      expect((await A.client.from("activity_log").select("id").eq("event_id", eventId)).data!.length).toBeGreaterThanOrEqual(1);
      for (const u of [B, G, D]) {
        expect((await u.client.from("activity_log").select("id").eq("event_id", eventId)).data ?? []).toEqual([]);
      }
      const r = await A.client.from("activity_log").insert({ event_id: eventId, actor_id: A.id, action: "x" });
      expect(r.error).not.toBeNull();
    });
  });

  describe("deleting the event", () => {
    it("Guest and Member cannot; the Admin can", async () => {
      for (const u of [G, B, D]) {
        const r = await u.client.from("events").delete().eq("id", eventId).select();
        expect(r.data ?? []).toEqual([]);
      }
      const ok = await A.client.from("events").delete().eq("id", eventId).select();
      expect(ok.data).toHaveLength(1);
      expect((await admin().from("tasks").select("id").eq("event_id", eventId)).data).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run and watch it fail**

Run: `npm run test:db`
Expected: `rls.test.ts` fails (without RLS, outsiders can read rows). `functions.test.ts` still passes.

- [ ] **Step 3: Write the policies**

Create `supabase/migrations/0003_rls.sql`:
```sql
-- Row level security on every table. Expectations come from report Table 5.2 and lib/permissions.ts.
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.invitations enable row level security;
alter table public.guests enable row level security;
alter table public.expenses enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_log enable row level security;

-- profiles: your own, and people who share an event with you
create policy "read own or co-member profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_event_with(id));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- events: no insert policy, events are created through create_event_with_admin()
create policy "members read their events" on public.events for select to authenticated
  using (public.is_member(id));
create policy "only admins update events" on public.events for update to authenticated
  using (public.has_role(id, 'admin')) with check (public.has_role(id, 'admin'));
create policy "only admins delete events" on public.events for delete to authenticated
  using (public.has_role(id, 'admin'));

-- event_members: no insert policy, rows appear through accept_invitation() and create_event_with_admin()
create policy "members read co-members" on public.event_members for select to authenticated
  using (public.is_member(event_id));
create policy "admins change roles" on public.event_members for update to authenticated
  using (public.has_role(event_id, 'admin')) with check (public.has_role(event_id, 'admin'));
create policy "admins remove members" on public.event_members for delete to authenticated
  using (public.has_role(event_id, 'admin'));

-- invitations: Admin only
create policy "admins read invitations" on public.invitations for select to authenticated
  using (public.has_role(event_id, 'admin'));
create policy "admins create invitations" on public.invitations for insert to authenticated
  with check (public.has_role(event_id, 'admin') and created_by = auth.uid());
create policy "admins delete invitations" on public.invitations for delete to authenticated
  using (public.has_role(event_id, 'admin'));

-- guests (module planned): Admin and Member
create policy "members read guests" on public.guests for select to authenticated
  using (public.has_role(event_id, 'member'));
create policy "members add guests" on public.guests for insert to authenticated
  with check (public.has_role(event_id, 'member') and added_by = auth.uid());
create policy "members update guests" on public.guests for update to authenticated
  using (public.has_role(event_id, 'member')) with check (public.has_role(event_id, 'member'));
create policy "admins delete guests" on public.guests for delete to authenticated
  using (public.has_role(event_id, 'admin'));

-- expenses (module planned): Admin and Member log, paid_by is the caller
create policy "members read expenses" on public.expenses for select to authenticated
  using (public.has_role(event_id, 'member'));
create policy "members log expenses" on public.expenses for insert to authenticated
  with check (public.has_role(event_id, 'member') and paid_by = auth.uid());
create policy "admins update expenses" on public.expenses for update to authenticated
  using (public.has_role(event_id, 'admin')) with check (public.has_role(event_id, 'admin'));
create policy "admins delete expenses" on public.expenses for delete to authenticated
  using (public.has_role(event_id, 'admin'));

-- tasks (module planned): Admin creates; an assignee updates, guard_task_update() limits them to status
create policy "members read tasks" on public.tasks for select to authenticated
  using (public.has_role(event_id, 'member'));
create policy "admins create tasks" on public.tasks for insert to authenticated
  with check (public.has_role(event_id, 'admin'));
create policy "admins or assignees update tasks" on public.tasks for update to authenticated
  using (public.has_role(event_id, 'admin') or (assigned_to = auth.uid() and public.has_role(event_id, 'member')))
  with check (public.has_role(event_id, 'admin') or (assigned_to = auth.uid() and public.has_role(event_id, 'member')));
create policy "admins delete tasks" on public.tasks for delete to authenticated
  using (public.has_role(event_id, 'admin'));

-- activity_log (module planned): Admin reads, rows are written by triggers only
create policy "admins read activity" on public.activity_log for select to authenticated
  using (public.has_role(event_id, 'admin'));

-- Guard: fail this migration if any public table lacks RLS (security NFR, report Table 6.3).
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and not rowsecurity) then
    raise exception 'Row level security is missing on a public table';
  end if;
end $$;
```

- [ ] **Step 4: Push and run the whole database suite**

Run:
```bash
npx supabase db push
npm run test:db
```
Expected: `functions.test.ts` and `rls.test.ts` all pass. If a policy test fails, fix the policy so it matches Table 5.2, not the test, unless the test contradicts the table.

- [ ] **Step 5: Run Supabase's security advisor**

In the dashboard open Advisors, Security. Expected: no "RLS disabled" findings. Note any other warning in `docs/acceptance/security-advisor.md` for the report.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: row level security on every table with a role-by-role policy script"
```

---

### Task 12: Supabase data source, real authentication and the swap

Covers FR-01 to FR-14 against the real backend.

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`, `proxy.ts`, `app/auth/confirm/route.ts`, `lib/data/supabase-map.ts`, `lib/data/supabase-map.test.ts`, `supabase/tests/datasource.test.ts`
- Modify: `lib/data/supabase.ts` (replace the stub), `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: the migrations (Tasks 10 and 11), `DataSource` (Task 5), env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Produces: `SupabaseDataSource` (constructor takes an optional client factory so tests can inject a signed-in client), `createClient()` (server), `createBrowserClient` wrapper, `updateSession(request)`, `proxy`.

- [ ] **Step 1: Check the current Supabase guide before writing the clients**

Open https://supabase.com/docs/guides/auth/server-side/nextjs and compare with Steps 3 to 5. If the guide's `createServerClient` cookie handling or `getClaims` usage differs, follow the guide and keep the behaviours described here (cookie refresh in `proxy.ts`, `getClaims()` for trust, no `getSession()` in server code).

- [ ] **Step 2: Write the failing mapper test**

Create `lib/data/supabase-map.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { embeddedCount, toEventRecord, toInvitation, toProfile } from "./supabase-map";

describe("supabase row mappers", () => {
  it("maps an events row and turns numeric strings into numbers", () => {
    expect(toEventRecord({
      id: "e1", name: "Ayesha's Mehndi", type: "mehndi", event_date: "2026-12-14", location: "Lahore",
      description: null, total_budget: "500000.00", cover_color: "mehndi", created_by: "u1", created_at: "2026-10-01T09:00:00Z",
    })).toEqual({
      id: "e1", name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
      description: null, totalBudget: 500000, coverColor: "mehndi", createdBy: "u1", createdAt: "2026-10-01T09:00:00Z",
    });
  });
  it("reads an embedded count and defaults to zero", () => {
    expect(embeddedCount([{ count: 6 }])).toBe(6);
    expect(embeddedCount([])).toBe(0);
    expect(embeddedCount(undefined)).toBe(0);
  });
  it("maps an invitation and a profile", () => {
    expect(toInvitation({ id: "i1", event_id: "e1", token: "t", role: "guest", expires_at: "2026-10-15T00:00:00Z", used_count: 2 }))
      .toEqual({ id: "i1", eventId: "e1", token: "t", role: "guest", expiresAt: "2026-10-15T00:00:00Z", usedCount: 2 });
    expect(toProfile({ id: "u1", full_name: "Rashid Mehmood", email: "r@example.com", phone: null }))
      .toEqual({ id: "u1", fullName: "Rashid Mehmood", email: "r@example.com", phone: null });
  });
});
```
Run: `npx vitest run lib/data/supabase-map.test.ts`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement the mappers**

Create `lib/data/supabase-map.ts`:
```ts
import type { CoverColor, EventType } from "@/lib/constants";
import type { EventRecord, Invitation, InviteRole, Profile } from "./types";

export type EventRow = {
  id: string; name: string; type: EventType; event_date: string; location: string | null;
  description: string | null; total_budget: number | string; cover_color: CoverColor;
  created_by: string; created_at: string;
};
export type InvitationRow = { id: string; event_id: string; token: string; role: InviteRole; expires_at: string; used_count: number };
export type ProfileRow = { id: string; full_name: string; email: string; phone: string | null };

export const toEventRecord = (r: EventRow): EventRecord => ({
  id: r.id, name: r.name, type: r.type, eventDate: r.event_date, location: r.location,
  description: r.description, totalBudget: Number(r.total_budget), coverColor: r.cover_color,
  createdBy: r.created_by, createdAt: r.created_at,
});

export const toInvitation = (r: InvitationRow): Invitation => ({
  id: r.id, eventId: r.event_id, token: r.token, role: r.role, expiresAt: r.expires_at, usedCount: r.used_count,
});

export const toProfile = (r: ProfileRow): Profile => ({ id: r.id, fullName: r.full_name, email: r.email, phone: r.phone });

/** PostgREST returns an embedded count as [{ count: n }]. */
export const embeddedCount = (rows: { count: number }[] | undefined | null): number => rows?.[0]?.count ?? 0;
```
Run: `npx vitest run lib/data/supabase-map.test.ts`. Expected: pass.

- [ ] **Step 4: Supabase clients and the session proxy**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
```
Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component. The proxy refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}
```
Create `lib/supabase/proxy.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/events", "/profile"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() validates the token. Never trust getSession() on the server.
  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  if (!data?.claims && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return response;
}
```
Create `proxy.ts` at the project root:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (process.env.DATA_SOURCE !== "supabase") return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```
Every server action also checks the user itself (the data source returns `auth` when no user), because the proxy does not cover Server Function calls on excluded paths.

- [ ] **Step 5: Email link route and login notice**

Create `app/auth/confirm/route.ts`:
```ts
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Same-site paths only. Accepts "/events" or an absolute URL on this origin. */
function safeNext(next: string | null, origin: string): string {
  if (!next) return "/events";
  try {
    const url = new URL(next, origin);
    return url.origin === origin ? url.pathname + url.search : "/events";
  } catch {
    return "/events";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"), origin);

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) redirect(next);
  }
  redirect("/login?error=link");
}
```
Modify `app/(auth)/login/page.tsx` to show the notice. Replace the page with:
```tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[2rem]">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to see the events you belong to.</p>
      </div>
      {error === "link" && (
        <p role="alert" className="rounded-md bg-over-tint p-3 text-sm text-over">That link has expired. Request a new one.</p>
      )}
      <LoginForm next={next ?? ""} />
    </div>
  );
}
```

- [ ] **Step 6: Write the failing data source contract test**

This test runs the same flows the mock tests cover, against the real database, using clients already signed in as test users.

Create `supabase/tests/datasource.test.ts`:
```ts
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SupabaseDataSource } from "@/lib/data/supabase";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS } from "@/lib/messages";
import type { EventInput } from "@/lib/validation/event";
import { admin, cleanup, hasEnv, makeUser, type TestUser } from "./helpers";

vi.setConfig({ testTimeout: 30_000, hookTimeout: 60_000 });

const input: EventInput = {
  name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
  description: null, totalBudget: 500000, coverColor: "mehndi",
};

describe.skipIf(!hasEnv)("SupabaseDataSource matches the mock's behaviour", () => {
  let A: TestUser, B: TestUser, G: TestUser, D: TestUser;
  let dsA: SupabaseDataSource, dsB: SupabaseDataSource, dsG: SupabaseDataSource, dsD: SupabaseDataSource;
  const eventIds: string[] = [];

  beforeAll(async () => {
    [A, B, G, D] = await Promise.all([makeUser("admin"), makeUser("member"), makeUser("guest"), makeUser("outsider")]);
    dsA = new SupabaseDataSource(async () => A.client);
    dsB = new SupabaseDataSource(async () => B.client);
    dsG = new SupabaseDataSource(async () => G.client);
    dsD = new SupabaseDataSource(async () => D.client);
  });
  afterAll(() => cleanup({ eventIds, userIds: [A?.id, B?.id, G?.id, D?.id].filter(Boolean) }));

  async function setup() {
    const created = await dsA.createEvent(input);
    if (!created.ok) throw new Error(created.message);
    eventIds.push(created.data.id);
    const eventId = created.data.id;
    const m = await dsA.createInvitation(eventId, "member");
    const g = await dsA.createInvitation(eventId, "guest");
    if (!m.ok || !g.ok) throw new Error("invites");
    await dsB.acceptInvitation(m.data.token);
    await dsG.acceptInvitation(g.data.token);
    return { eventId, memberToken: m.data.token };
  }

  it("creator is Admin; non-members get not_found with the exact message (FR-06, TC-10)", async () => {
    const { eventId } = await setup();
    const detail = await dsA.getEvent(eventId);
    expect(detail.ok && detail.data.role).toBe("admin");
    expect(detail.ok && detail.data.memberCount).toBe(3);
    expect(await dsD.getEvent(eventId)).toEqual({ ok: false, code: "not_found", message: NO_ACCESS });
    expect(await dsD.listMyEvents()).toEqual([]);
  });

  it("lists my events with my role (FR-09)", async () => {
    await setup();
    const mine = await dsB.listMyEvents();
    expect(mine.length).toBeGreaterThanOrEqual(1);
    expect(mine.every((e) => e.role === "member")).toBe(true);
  });

  it("only the Admin edits; the Member is forbidden (FR-07, TC-06)", async () => {
    const { eventId } = await setup();
    const denied = await dsB.updateEvent(eventId, { ...input, name: "Hacked" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.code).toBe("forbidden");
    const ok = await dsA.updateEvent(eventId, { ...input, name: "Ayesha's Mehndi Night" });
    expect(ok.ok && ok.data.name).toBe("Ayesha's Mehndi Night");
  });

  it("lists members for Admin and Member but not Guest", async () => {
    const { eventId } = await setup();
    const list = await dsA.listMembers(eventId);
    expect(list.ok && list.data.map((x) => x.role)).toEqual(["admin", "member", "guest"]);
    expect((await dsB.listMembers(eventId)).ok).toBe(true);
    const denied = await dsG.listMembers(eventId);
    expect(denied.ok).toBe(false);
  });

  it("unknown and expired links are rejected with the exact message (FR-12, TC-08)", async () => {
    const { eventId } = await setup();
    await admin().from("invitations").insert({
      event_id: eventId, token: "ds-expired-1", role: "member", created_by: A.id,
      expires_at: new Date(Date.now() - 86_400_000).toISOString(),
    });
    expect(await dsD.acceptInvitation("nope")).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    expect(await dsD.acceptInvitation("ds-expired-1")).toEqual({ ok: false, code: "invite_invalid", message: INVITE_INVALID });
    expect((await dsD.getInvitationPreview("ds-expired-1")).ok).toBe(false);
  });

  it("previews a valid link with the inviter's name", async () => {
    const { memberToken } = await setup();
    const p = await dsD.getInvitationPreview(memberToken);
    expect(p.ok && p.data.eventName).toBe("Ayesha's Mehndi");
    expect(p.ok && p.data.inviterName).toBe("admin");
    expect(p.ok && p.data.role).toBe("member");
  });

  it("changes roles, removes people, and protects the last Admin (FR-13, TC-09, TC-14)", async () => {
    const { eventId } = await setup();
    expect((await dsB.changeRole(eventId, G.id, "admin")).ok).toBe(false);
    expect((await dsA.changeRole(eventId, G.id, "member")).ok).toBe(true);
    expect(await dsA.changeRole(eventId, A.id, "member")).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    expect(await dsA.removeMember(eventId, A.id)).toEqual({ ok: false, code: "last_admin", message: LAST_ADMIN });
    expect((await dsA.removeMember(eventId, G.id)).ok).toBe(true);
    expect((await dsG.listMyEvents()).some((e) => e.id === eventId)).toBe(false);
  });

  it("deletes only with the exact name and removes the event for everyone (FR-08, TC-11)", async () => {
    const { eventId } = await setup();
    expect((await dsA.deleteEvent(eventId, "wrong name")).ok).toBe(false);
    const memberTry = await dsB.deleteEvent(eventId, "Ayesha's Mehndi");
    expect(memberTry.ok).toBe(false);
    expect((await dsA.deleteEvent(eventId, "Ayesha's Mehndi")).ok).toBe(true);
    expect(await dsB.listMyEvents()).toEqual(expect.not.arrayContaining([expect.objectContaining({ id: eventId })]));
  });

  it("updates the profile (FR-04, TC-12)", async () => {
    const r = await dsA.updateProfile({ fullName: "Admin Person", phone: "0300 1234567" });
    expect(r.ok && r.data.phone).toBe("0300 1234567");
    expect((await dsA.getCurrentUser())?.fullName).toBe("Admin Person");
  });
});
```
Run: `npm run test:db -- supabase/tests/datasource.test.ts`
Expected: FAIL (the `SupabaseDataSource` is still the stub).

- [ ] **Step 7: Implement `SupabaseDataSource`**

Replace `lib/data/supabase.ts`:
```ts
import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { INVITE_DAYS } from "@/lib/constants";
import { INVITE_INVALID, LAST_ADMIN, NO_ACCESS, NOT_SIGNED_IN } from "@/lib/messages";
import { can, type Role } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type { RegisterInput } from "@/lib/validation/auth";
import type { EventInput } from "@/lib/validation/event";
import type { ProfileInput } from "@/lib/validation/profile";
import { fail, ok, type Result } from "./result";
import {
  embeddedCount, toEventRecord, toInvitation, toProfile,
  type EventRow, type InvitationRow, type ProfileRow,
} from "./supabase-map";
import type {
  DataSource, EventDetail, EventRecord, EventSummary, Invitation, InvitePreview, InviteRole, Member, Profile,
} from "./types";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export class SupabaseDataSource implements DataSource {
  /** Tests pass a client already signed in as a test user. The app uses the cookie-backed server client. */
  constructor(private getClient: () => Promise<SupabaseClient> = createClient) {}

  // ---- auth and profile ----
  async signUp(input: RegisterInput) {
    const sb = await this.getClient();
    const origin = await siteOrigin();
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.fullName }, emailRedirectTo: `${origin}/events` },
    });
    if (error) {
      return error.code === "user_already_exists"
        ? fail("exists", "An account with this email already exists. Sign in instead.")
        : fail("invalid", error.message);
    }
    return ok({ needsConfirmation: !data.session });
  }
  async signIn(input: { email: string; password: string }) {
    const sb = await this.getClient();
    const { error } = await sb.auth.signInWithPassword(input);
    if (error) return fail("auth", "Invalid login credentials");
    const me = await this.getCurrentUser();
    return me ? ok(me) : fail("auth", "Invalid login credentials");
  }
  async signOut() {
    await (await this.getClient()).auth.signOut();
  }
  async requestPasswordReset(email: string) {
    const origin = await siteOrigin();
    await (await this.getClient()).auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
    return ok(null); // never reveal whether an address has an account
  }
  async resetPassword(newPassword: string) {
    const { error } = await (await this.getClient()).auth.updateUser({ password: newPassword });
    return error ? fail("auth", "Your reset link has expired. Request a new one.") : ok(null);
  }
  async getCurrentUser(): Promise<Profile | null> {
    const sb = await this.getClient();
    const { data } = await sb.auth.getClaims();
    const id = data?.claims?.sub;
    if (!id) return null;
    const { data: row } = await sb.from("profiles").select("id, full_name, email, phone").eq("id", id).maybeSingle();
    return row ? toProfile(row as ProfileRow) : null;
  }
  async updateProfile(input: ProfileInput) {
    const sb = await this.getClient();
    const me = await this.getCurrentUser();
    if (!me) return fail("auth", NOT_SIGNED_IN);
    const { data, error } = await sb.from("profiles")
      .update({ full_name: input.fullName, phone: input.phone }).eq("id", me.id)
      .select("id, full_name, email, phone").single();
    return error || !data ? fail("invalid", "Couldn't save your profile. Try again.") : ok(toProfile(data as ProfileRow));
  }

  // ---- events ----
  async listMyEvents(): Promise<EventSummary[]> {
    const sb = await this.getClient();
    const me = await this.getCurrentUser();
    if (!me) return [];
    const { data } = await sb.from("event_members")
      .select("role, events(*, event_members(count))")
      .eq("user_id", me.id);
    type Row = { role: Role; events: (EventRow & { event_members: { count: number }[] }) | null };
    return ((data ?? []) as unknown as Row[])
      .filter((r): r is Row & { events: NonNullable<Row["events"]> } => r.events !== null)
      .map((r) => ({ ...toEventRecord(r.events), role: r.role, memberCount: embeddedCount(r.events.event_members) }))
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }
  async getEvent(eventId: string): Promise<Result<EventDetail>> {
    const sb = await this.getClient();
    const me = await this.getCurrentUser();
    if (!me) return fail("not_found", NO_ACCESS);
    const [ev, mem] = await Promise.all([
      sb.from("events").select("*, event_members(count)").eq("id", eventId).maybeSingle(),
      sb.from("event_members").select("role").eq("event_id", eventId).eq("user_id", me.id).maybeSingle(),
    ]);
    if (!ev.data || !mem.data) return fail("not_found", NO_ACCESS);
    const row = ev.data as EventRow & { event_members: { count: number }[] };
    return ok({ event: toEventRecord(row), role: mem.data.role as Role, memberCount: embeddedCount(row.event_members) });
  }
  async createEvent(input: EventInput): Promise<Result<EventRecord>> {
    const sb = await this.getClient();
    const { data, error } = await sb.rpc("create_event_with_admin", {
      p_name: input.name, p_type: input.type, p_date: input.eventDate, p_location: input.location,
      p_description: input.description, p_budget: input.totalBudget, p_cover: input.coverColor,
    });
    if (error?.message === "not_signed_in") return fail("auth", NOT_SIGNED_IN);
    if (error || !data) return fail("invalid", "Couldn't create the event. Check the details and try again.");
    return ok(toEventRecord(data as EventRow));
  }
  async updateEvent(eventId: string, input: EventInput): Promise<Result<EventRecord>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.edit")) return fail("forbidden", "Only the Admin can edit this event.");
    const sb = await this.getClient();
    const { data, error } = await sb.from("events").update({
      name: input.name, type: input.type, event_date: input.eventDate, location: input.location,
      description: input.description, total_budget: input.totalBudget, cover_color: input.coverColor,
    }).eq("id", eventId).select("*").maybeSingle();
    if (error || !data) return fail("forbidden", "Only the Admin can edit this event.");
    return ok(toEventRecord(data as EventRow));
  }
  async deleteEvent(eventId: string, confirmName: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.delete")) return fail("forbidden", "Only the Admin can delete this event.");
    if (confirmName.trim() !== detail.data.event.name) return fail("invalid", "Type the event name exactly to confirm.");
    const { data, error } = await (await this.getClient()).from("events").delete().eq("id", eventId).select("id");
    return error || !data?.length ? fail("forbidden", "Only the Admin can delete this event.") : ok(null);
  }

  // ---- members ----
  async listMembers(eventId: string): Promise<Result<Member[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "event.viewFull")) return fail("forbidden", "You don't have access to the member list.");
    const { data } = await (await this.getClient()).from("event_members")
      .select("role, joined_at, profiles(id, full_name, email)").eq("event_id", eventId);
    const order: Record<Role, number> = { admin: 0, member: 1, guest: 2 };
    type Row = { role: Role; joined_at: string; profiles: { id: string; full_name: string; email: string } | null };
    const members = ((data ?? []) as unknown as Row[])
      .filter((r): r is Row & { profiles: NonNullable<Row["profiles"]> } => r.profiles !== null)
      .map((r) => ({ userId: r.profiles.id, fullName: r.profiles.full_name, email: r.profiles.email, role: r.role, joinedAt: r.joined_at }))
      .sort((a, b) => order[a.role] - order[b.role] || a.joinedAt.localeCompare(b.joinedAt));
    return ok(members);
  }
  async changeRole(eventId: string, userId: string, role: Role): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can change roles.");
    const { data, error } = await (await this.getClient()).from("event_members")
      .update({ role }).eq("event_id", eventId).eq("user_id", userId).select("id");
    if (error?.message === "last_admin") return fail("last_admin", LAST_ADMIN);
    if (error) return fail("invalid", "Couldn't change the role. Try again.");
    return data?.length ? ok(null) : fail("not_found", "That person isn't a member of this event.");
  }
  async removeMember(eventId: string, userId: string): Promise<Result<null>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "member.manage")) return fail("forbidden", "Only the Admin can remove people.");
    const { data, error } = await (await this.getClient()).from("event_members")
      .delete().eq("event_id", eventId).eq("user_id", userId).select("id");
    if (error?.message === "last_admin") return fail("last_admin", LAST_ADMIN);
    if (error) return fail("invalid", "Couldn't remove that person. Try again.");
    return data?.length ? ok(null) : fail("not_found", "That person isn't a member of this event.");
  }

  // ---- invitations ----
  async createInvitation(eventId: string, role: InviteRole): Promise<Result<Invitation>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can create invite links.");
    const me = (await this.getCurrentUser())!;
    const token = randomBytes(16).toString("base64url"); // 128 bits, 22 URL-safe characters
    const expires = new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString();
    const { data, error } = await (await this.getClient()).from("invitations")
      .insert({ event_id: eventId, token, role, created_by: me.id, expires_at: expires })
      .select("id, event_id, token, role, expires_at, used_count").single();
    return error || !data ? fail("forbidden", "Only the Admin can create invite links.") : ok(toInvitation(data as InvitationRow));
  }
  async listInvitations(eventId: string): Promise<Result<Invitation[]>> {
    const detail = await this.getEvent(eventId);
    if (!detail.ok) return detail;
    if (!can(detail.data.role, "invite.create")) return fail("forbidden", "Only the Admin can see invite links.");
    const { data } = await (await this.getClient()).from("invitations")
      .select("id, event_id, token, role, expires_at, used_count")
      .eq("event_id", eventId).gt("expires_at", new Date().toISOString()).order("expires_at", { ascending: false });
    return ok(((data ?? []) as InvitationRow[]).map(toInvitation));
  }
  async getInvitationPreview(token: string): Promise<Result<InvitePreview>> {
    const { data } = await (await this.getClient()).rpc("invitation_preview", { p_token: token });
    const row = (data as { event_name: string; event_date: string; location: string | null; cover_color: string; inviter_name: string; role: InviteRole }[] | null)?.[0];
    if (!row) return fail("invite_invalid", INVITE_INVALID);
    return ok({
      eventName: row.event_name, eventDate: row.event_date, location: row.location,
      coverColor: row.cover_color as InvitePreview["coverColor"], inviterName: row.inviter_name, role: row.role,
    });
  }
  async acceptInvitation(token: string): Promise<Result<{ eventId: string }>> {
    const me = await this.getCurrentUser();
    if (!me) return fail("auth", "Sign in to join this event.");
    const { data, error } = await (await this.getClient()).rpc("accept_invitation", { p_token: token });
    if (error?.message === "invalid_invite") return fail("invite_invalid", INVITE_INVALID);
    if (error || !data) return fail("invalid", "Couldn't join the event. Try again.");
    return ok({ eventId: data as string });
  }
}
```

- [ ] **Step 8: Run the contract test and the whole suite**

Run:
```bash
npm run test:db
npm test
npx tsc --noEmit
```
Expected: all pass. A failure in `datasource.test.ts` that the mock test does not have means the two implementations disagree; fix `supabase.ts` (or the migration), not the test.

- [ ] **Step 9: Configure Supabase Auth for the app (needs your account)**

In the dashboard, Authentication:
1. URL Configuration. Site URL `http://localhost:3000` for development; add your Vercel URL to Redirect URLs, plus `http://localhost:3000/**` and `https://<your-app>.vercel.app/**`.
2. Email templates. Confirm signup:
```html
<h2>Confirm your Festara account</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm email address</a></p>
```
Reset password:
```html
<h2>Reset your Festara password</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset password</a></p>
```
Check https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr in case the template variables changed.

- [ ] **Step 10: Swap the app to Supabase and walk through it**

Create a second Supabase project for development or reuse `festara-test`. Set in `.env.local`:
```
DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=<project url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```
Run `npm run dev`. Register with a real email, confirm from the email, create an event, create an invite link, open it in a private window with a second account, change roles, delete. Expected: identical behaviour to the Task 6 to 9 walkthroughs, and the prototype banner is gone.

- [ ] **Step 11: Commit and set the Vercel environment**

```bash
git add -A
git commit -m "feat: Supabase data source, real auth, session proxy and email confirmation"
```
In Vercel set `DATA_SOURCE=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, redeploy, and repeat Step 10 on the deployed URL.

---

### Task 13: Acceptance and evidence

Covers the definition of done (spec section 12) and the remaining open items.

**Files:**
- Create: `docs/acceptance/tc-results.md`, `docs/acceptance/report-todo.md`, `docs/acceptance/screenshots/` (all in `festara-app`)

**Interfaces:**
- Consumes: the deployed app on Vercel against Supabase.
- Produces: recorded test results, performance numbers, real screenshots and a to-do list for the report. The report itself is not touched.

- [ ] **Step 1: Run every automated check**

Run in `festara-app`:
```bash
npm test
npm run test:db
npx tsc --noEmit
npm run lint
npm run build
```
Expected: all green. Save the `npm run test:db` output summary in `docs/acceptance/tc-results.md` under a heading "Automated".

- [ ] **Step 2: Execute the test cases TC-01 to TC-14**

Use the Vercel URL and the Supabase project. Record Actual Result and Status (Pass or Fail) for each in `docs/acceptance/tc-results.md`. TC-01 to TC-11 are in report Table 6.2 (they are run exactly as written there). Add these three, which are new:

| ID | Req | Case | Steps | Expected |
|---|---|---|---|---|
| TC-12 | FR-04 | Update profile | Sign in, open Profile, change the name, enter phone `0300 1234567`, save | "Profile saved."; the header menu shows the new name; reload shows the stored phone; a phone like `call me` is rejected with "Enter a valid phone number, like 0300 1234567." |
| TC-13 | FR-09 | Home lists only my events with role | Sign in as a user who is Admin of one event and Member of another; open `/events` | Both events show with correct role badges; an event of another user does not appear |
| TC-14 | FR-13 | Admin changes a role and removes a member | As Admin open Members, change a Member to Guest, then remove them | Role badge updates; after removal the person's `/events` no longer lists the event and opening its URL shows "This event doesn't exist, or you don't have access to it." |

Fix any failure before continuing; never edit a test case to make it pass.

- [ ] **Step 3: Performance check**

In Chrome DevTools, Lighthouse, Mobile, signed in on the deployed `/events`. Record LCP (target under 2.5 s) and note the throttling used in `docs/acceptance/tc-results.md`. Also check `/login` the same way. If LCP is over target, look at the largest element (the fonts and the cover images are the usual cause) and fix before continuing.

- [ ] **Step 4: Capture the real screenshots**

At 1280 px wide (browser window, no dev tools), capture these from the deployed app and save PNGs in `docs/acceptance/screenshots/`: `login.png` (Figure 5.1), `create-event.png` (Figure 5.2), `members-invite.png` (Figure 5.5). For Figures 4.2 to 4.4 (the design prototypes) capture the matching sections of `../brand/festara-brand.html` (Screens) as `design-1.png`, `design-2.png`, `design-3.png`.

- [ ] **Step 5: Queue the report edits (do not edit the report)**

Create `docs/acceptance/report-todo.md` with this content, so the later report rebuild starts from a checklist:
```markdown
# Report changes queued for the next rebuild

Campus: Multan. The report cover, certificate and proposal still say Islamabad.

1. Appendix I, `events`: add `cover_color | text | not null, default 'mehndi'; one of mehndi, marigold, sindoor, kahwa, sky, night`. `profiles`: add `email | text | not null | copied from the sign-in account, shown to other members of the same event`.
2. Appendix I: state the stored `event_type` values: wedding, engagement, mehndi, walima, birthday, eid_gathering, trip, university_event, other.
3. Section 5.3.3 (invites): the invite page shows event name, date, place and inviter before sign-in through the database function `invitation_preview`; a signed-in member who opens a link keeps their role and the use count does not change.
4. Table 3.2 and software list: "Node.js 18+" becomes "Node.js 20.9 or newer (required by Next.js 16)".
5. Table 6.2: add TC-12, TC-13, TC-14 (definitions are in Step 2 of Task 13).
6. Tables 6.1 and 6.2: copy Actual Result and Status from `tc-results.md`; section 6.5 should say 14 requirements covered by 14 cases.
7. Section 6.2.5 and Table 6.3: policy script is `supabase/tests/rls.test.ts`; record the Lighthouse and security-advisor numbers.
8. Keep "Completed" only for features whose test cases passed.
9. Replace the six screenshot placeholders (Figures 4.2 to 4.4, 5.1, 5.2, 5.5) with the images in `docs/acceptance/screenshots/`.
10. Optional: build figures with the Festara palette using `BRAND=1 python diagrams.py <dir>`.
11. Confirm the committee names on the certificate (they are the Multan template names).
```

- [ ] **Step 6: Final definition-of-done check**

Walk through spec section 12 and tick each line with evidence: the automated test output, `tc-results.md`, the Lighthouse number, the screenshots, the deployed URL. Anything unticked is the next task, not "done".

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs: acceptance results, screenshots and queued report changes for the 40% milestone"
```

---

## Self-Review

**Spec coverage.** Spec section 3 (FR-01 to FR-14): FR-01/02/03 Task 6 (screens, actions) and Task 12 (real auth), tests TC-01 to TC-03 in Task 13; FR-04 Task 9 and Task 12, TC-12; FR-05/06 Tasks 7 and 10, TC-04/05; FR-07 Tasks 7 and 11, TC-06; FR-08 Tasks 7 and 11, TC-11; FR-09 Task 7, TC-13; FR-10/11/12 Tasks 8 and 10, TC-07/08; FR-13 Tasks 8 and 10, TC-09/14; FR-14 Tasks 3 and 11. Spec section 6 data model and functions: Task 10 and 11. Section 7 invite algorithm: Tasks 5, 10, 12. Section 8 screens and states: Tasks 6 to 9. Section 9 testing: Tasks 2 to 5, 10 to 13. Section 11 deviations: queued in Task 13 Step 5. Section 12 definition of done: Task 13 Step 7.

**Placeholder scan.** No TBD or "handle edge cases" steps. Three places depend on information that does not exist until execution: the generated shadcn files in Task 1 Step 7 and Task 6 Step 5 (steps give exact edits by rule and by `grep`), and the test results recorded in Task 13 Step 2.

**Type consistency.** `DataSource`, `Result`, `ok`/`fail`, `can`, `Role`, `formatMoney`, `daysLeft`, `ActionState` and the server action names are used identically across tasks. Error codes used in `supabase.ts` (`last_admin`, `invalid_invite`, `not_signed_in`, `only_status`) match the SQL in Task 10. Database column names match the mappers in Task 12.

## Execution Handoff

Plan complete. Two ways to run it:

1. **Subagent-driven (recommended).** A fresh subagent per task with review between tasks. Tasks 1 to 9 are independent of your Supabase account and can run first; Tasks 10 to 13 need the Supabase project and dashboard access.
2. **Inline.** Run the tasks in one session with checkpoints after Task 5, Task 9 (prototype demo) and Task 12 (real backend).

Start with Task 1. It needs only Node 20.9 or newer.
