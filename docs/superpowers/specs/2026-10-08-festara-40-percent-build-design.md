# Festara 40% Build: Design Spec

Date: 2026-10-08. Team: Anas Altaf (MC-331), Hammad Ansar (MC-304), Muhammad Sami Ullah (MC-336). Supervisor: Tahira Iqbal.
Status: draft for team review. Decisions 2026-10-08: campus is Multan; building the report is deferred, only the app is built now. The implementation plan is `docs/superpowers/plans/2026-10-08-festara-40-percent-build.md`.

## 1. Goal and scope

Build the application for the 40% milestone and bring it to parity with what the 40% report already claims.

**In scope (40%).** Functional requirements FR-01 to FR-14 from the report (Table 3.3): Authentication, Event Management, Role-Based Access Control with invite links. The full database schema with row level security on every table. The brand from `brand/` applied to every 40% screen.

**Out of scope.** Guests and RSVP screens (FR-15 to FR-17), Expenses (FR-18 to FR-21), Tasks (FR-22 to FR-24), Admin Dashboard (FR-25, FR-26), AI features (FR-27 to FR-29, Phase 2), and the public marketing landing page.

**Honesty rule.** The report may call a feature Completed only when it runs against the real Supabase backend and its test cases pass. A prototype on sample data is labelled as a prototype in any demo.

**Source of truth.** The proposal (`fypdocs/FYP_Proposal_Festara.docx.pdf`) and the 40% report source (`report_src/report.js`). Where this spec deviates from the report, section 11 says so. The report itself is not edited now; the pending changes are queued in `docs/acceptance/report-todo.md`.

## 2. Decisions already made

| Decision | Value | Why |
|---|---|---|
| Build order | UI first on mock data, then wire Supabase | Screens are what the supervisor sees first; brand book already specifies them |
| Seam | One `DataSource` interface with mock and Supabase implementations | Stops UI-first from becoming rework |
| Money | `Rs 412,000`, from `Intl.NumberFormat('en-PK')` | Locale-correct with no custom grouping code |
| UI base | shadcn/ui themed by `brand/tokens.css` | Accessible primitives, brand through tokens only |
| Aceternity UI | Public landing page only, later | Keeps the app calm and fast |
| Demo date | Not scheduled | Plan marks a prototype checkpoint after the screens |

## 3. Requirements traceability

Every FR maps to a screen, an action, a database object and a test. TC ids are from report Table 6.2. TC-12 to TC-14 are new, added here to cover FR-04, FR-09 and the full FR-13.

| FR | Requirement (short) | Screen | Action (`lib/actions`) | Database | Test |
|---|---|---|---|---|---|
| FR-01 | Register with name, email, password | `/register` | `signUpAction` | `auth.users`, trigger `handle_new_user` fills `profiles` | TC-01, `registerSchema` unit |
| FR-02 | Login, secure session | `/login` | `signInAction` | Supabase Auth, session in HTTP-only cookies | TC-02 |
| FR-03 | Reset forgotten password by email | `/forgot-password`, `/reset-password` | `forgotPasswordAction`, `resetPasswordAction` | Supabase Auth recovery | TC-03 |
| FR-04 | View and update name and phone | `/profile` | `updateProfileAction` | `profiles` update policy (own row) | TC-12 |
| FR-05 | Create event with all fields and budget | `/events/new` | `createEventAction` | `create_event_with_admin` | TC-04, TC-05 |
| FR-06 | Creator becomes Admin | `/events/new` | same | same function inserts `event_members` | TC-04 |
| FR-07 | Only Admin edits | `/events/[id]/settings` | `updateEventAction` | policy `only admins update events` | TC-06 |
| FR-08 | Only Admin deletes, with confirmation | `/events/[id]/settings` | `deleteEventAction` | policy admin delete, cascade | TC-11 |
| FR-09 | Home lists every event with role | `/events` | read via `listMyEvents` | policy `members read their events` | TC-13 |
| FR-10 | Admin generates invite for Member or Guest | `/events/[id]/members` | `createInvitationAction` | `invitations` insert policy (admin) | TC-07 |
| FR-11 | Valid link adds user with its role | `/invite/[token]` | `acceptInvitationAction` | `accept_invitation(p_token)` | TC-07 |
| FR-12 | Expired or unknown link rejected clearly | `/invite/[token]` | same | same function raises `invalid_invite` | TC-08 |
| FR-13 | Admin changes role or removes member | `/events/[id]/members` | `changeRoleAction`, `removeMemberAction` | update and delete policies, last-admin trigger | TC-09, TC-14 |
| FR-14 | Every read and write restricted by role | all | `can(role, action)` in UI and actions | RLS on every table | TC-06, TC-10, `rls.test.ts` |

## 4. Architecture

Stack (report Table 3.2, with versions checked against current docs on 2026-10-08):
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4. Node.js 20.9 or newer is required by Next.js 16.
- shadcn/ui, Zod, Vitest.
- Supabase (Postgres, Auth, RLS) through `@supabase/ssr` and `@supabase/supabase-js`.
- Vercel (Hobby) for deployment.

Next.js 16 renamed `middleware.ts` to `proxy.ts` with an exported `proxy` function. This app uses `proxy.ts`.

Folder layout follows report Table 5.1 with two additions (`lib/data/`, `lib/permissions.ts`):

```
festara-app/
  app/
    (auth)/login | register | forgot-password | reset-password
    auth/confirm/route.ts          email link verification
    events/                        home, new, [id] (overview, members, settings)
    invite/[token]/page.tsx
    profile/page.tsx
  components/ (ui/ = shadcn, brand/, event, members)
  lib/
    format.ts                      formatMoney
    permissions.ts                 can(role, action)
    validation/                    Zod schemas shared by forms, actions, tests
    data/                          DataSource interface, mock, supabase, index
    actions/                       server actions
    supabase/                      client, server, proxy helper
  proxy.ts
  supabase/migrations/ and supabase/tests/
```

## 5. The seam: DataSource

All reads and writes go through `lib/data/types.ts` `DataSource`. `lib/data/index.ts` returns the mock or Supabase implementation from the `DATA_SOURCE` env var (`mock` or `supabase`). Screens, server actions and tests never import an implementation directly.

Three shared units make the swap safe:
- `can(role, action)` in `lib/permissions.ts` is the only place app-side permissions are decided. It encodes report Table 5.2 and is tested for every role and action pair.
- `lib/validation/*` holds one Zod schema per form. UI and server actions use the same schema.
- The mock implements the same rules the database enforces (last Admin, expiry, already-member keeps role, role checks), so the UI behaves the same before and after the swap.

Result type: every mutating method returns `{ ok: true, data } | { ok: false, code, message }`. Codes: `invalid`, `forbidden`, `not_found`, `last_admin`, `invite_invalid`, `exists`, `auth`. `message` is the user-facing sentence.

## 6. Data model

Exactly report Appendix I, plus the deviations in section 11. All tables have RLS enabled. Currency is PKR. Timestamps are `timestamptz` with default `now()`.

Enums (the report leaves the stored literals open, fixed here):
- `event_type`: `wedding`, `engagement`, `mehndi`, `walima`, `birthday`, `eid_gathering`, `trip`, `university_event`, `other`
- `member_role`: `admin`, `member`, `guest`
- `rsvp_status`: `pending`, `confirmed`, `declined`
- `expense_category`: `venue`, `catering`, `decor`, `transport`, `photography`, `misc`
- `task_status`: `todo`, `in_progress`, `done`

Tables: `profiles`, `events`, `event_members`, `invitations`, `guests`, `expenses`, `tasks`, `activity_log`. The last four are created now so "RLS on 100% of tables" is true, but have no screens until their modules.

Database functions and triggers:
- `has_role(eid, r)`: true when the caller has role `r` or is `admin` (report Figure 5.3). `security definer`, so policies do not recurse.
- `is_member(eid)` and `shares_event_with(uid)`: helpers for the `event_members` and `profiles` policies.
- `handle_new_user()`: trigger on `auth.users`, creates the `profiles` row.
- `create_event_with_admin(...)`: inserts the event and the creator's Admin membership in one transaction.
- `accept_invitation(p_token)`: the algorithm in section 7.
- `invitation_preview(p_token)`: returns only event name, date, location, cover color, inviter name and role for a valid token. Callable without login.
- `guard_last_admin()`: trigger blocking demotion or removal of the last Admin. It does not fire when the whole event is being deleted.
- `guard_task_update()`: lets a non-Admin assignee change only `status`.
- `touch_updated_at()`: keeps `events.updated_at` current.

## 7. Invite algorithm

- Token: 16 cryptographically random bytes, URL-safe base64 (22 characters, 128 bits).
- Stored in `invitations` with role (`member` or `guest`), `expires_at = now() + 7 days`, `used_count = 0`.
- Link: `/invite/[token]`.

`accept_invitation(p_token)`:
1. Require a signed-in caller.
2. Select the invitation `for update`.
3. No row or `expires_at < now()`: raise `invalid_invite`. The UI shows "This invite link is invalid or has expired."
4. Caller already a member: keep their current role, do not change it.
5. Otherwise insert into `event_members` with the invitation role.
6. Increment `used_count`, return the event id, redirect to the event.

The invite page shows the event preview before login (from `invitation_preview`). Choosing Join sends a signed-out user to `/login?next=/invite/[token]`.

## 8. Screens and states

Visual source: `brand/festara-brand.html`, section Screens. Tokens: `brand/tokens.css`.

| Route | Purpose | States to build |
|---|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth | field errors, submitting, wrong password, link sent, expired reset link |
| `/profile` | Name, phone | saved, error |
| `/events` | Events home with role badges | loading skeleton, empty ("No events yet..."), error |
| `/events/new` | Create event, with cover color | field errors, negative budget, past date confirm |
| `/events/[id]` | Overview in event color | not found or no access |
| `/events/[id]/members` | Invite link, members, roles | no invite yet, link copied, last Admin blocked, remove confirm |
| `/events/[id]/settings` | Edit event, delete with typed name | saved, wrong name, deleting |
| `/invite/[token]` | Join or expired | valid, expired, already a member |

Every screen works from 360 px to 1920 px with no horizontal scroll, is keyboard operable, and uses tokens only (no raw hex, no Tailwind default colors).

## 9. Testing strategy

- **Unit (Vitest):** `formatMoney`; the full `can` matrix (every role and action in Table 5.2); every Zod schema; the mock data source (last Admin, expiry, already-member, forbidden, not found, delete confirmation).
- **Policy script (Vitest, needs a Supabase test project):** signs in as Admin, Member, Guest and a non-member and attempts every select, insert, update and delete on every table, with expectations derived from Table 5.2. Skipped when the test environment variables are absent.
- **Manual:** TC-01 to TC-14 on a Vercel preview with a separate Supabase test project, results recorded in report Tables 6.1 and 6.2.
- **Non-functional:** Lighthouse mobile on `/events` (LCP under 2.5 s); manual check at 360 px; Supabase security advisor shows RLS on all tables.

## 10. Risks

| Risk | Mitigation |
|---|---|
| UI-first rework when the backend arrives | The seam; shared `can` and Zod; the mock enforces database rules |
| Framework drift (Next.js 16, shadcn, Supabase SSR change quickly) | Plan Task 1 and Task 12 say to check the current official guide and compare before running |
| Supabase free-tier email limits slow auth testing | Use a custom SMTP only if needed; test accounts via the admin API |
| shadcn dark mode uses a `.dark` class, brand tokens use `data-theme` and `prefers-color-scheme` | Plan Task 1 replaces shadcn's color variables with the brand tokens and removes the `.dark` variant |
| Cache Components default in the Next.js 16 scaffold affects cookie-based pages | Plan Task 1 turns it off in `next.config.ts` for this app |

## 11. Deviations from the report, and open gaps

Deviations (each is deliberate and queued for the report in `docs/acceptance/report-todo.md`):
1. `events.cover_color` added (six values). The brand needs a per-event color.
2. `profiles.email` added, copied from auth by the trigger. The Members tab shows it.
3. `invitation_preview()` added so the invite page can show the event before login. The report redirects to login first.
4. Event type stored as snake_case enum literals.
5. Node.js 20.9 or newer is required. The report says Node 18 or newer.

Open gaps recorded here, not guessed:
- **Guest RSVP linkage.** The report's UC-05 describes a public RSVP link, while UC-02 requires login and the `guests` table has no user link. In the 40% scope a guest is a signed-in user with role `guest`. The RSVP design is decided in the Guests module spec.
- **Campus.** Multan (confirmed 2026-10-08). The report cover and proposal still say Islamabad; fix them when the report is next rebuilt.
- **Evaluation date.** None is stated anywhere. Needed to schedule the plan.
- **Test coverage.** FR-04, FR-09 and full FR-13 had no test case in the report. TC-12 to TC-14 are added.
- **Report placeholders.** Figures 4.2 to 4.4 and 5.1, 5.2, 5.5 are screenshot placeholders. Test result columns in Tables 6.1 and 6.2 are blank.

## 12. Definition of done for the 40%

- FR-01 to FR-14 each trace to a passing test (section 3).
- Policy script shows zero rows leaked to non-members and every Table 5.2 cell matches.
- Vitest suite green, `next build` succeeds, deployed on Vercel against the Supabase backend.
- TC-01 to TC-14 executed and recorded in `festara-app/docs/acceptance/`, with the six screenshots the report needs saved there.
- The report is NOT rebuilt now (deferred by the team). Its pending edits are listed in `docs/acceptance/report-todo.md` so nothing is lost.
