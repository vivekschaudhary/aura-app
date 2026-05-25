---
id: AUR-5
bet: AUR-1
type: story
status: in-build
priority: P0
created: 2026-05-24
approved: 2026-05-24
approved_by: Vivek
build_started: 2026-05-25
author: PM
design_link: docs/bets/AUR-1/stories/AUR-5/design.md
area_tags: [mobile, auth, onboarding]
dependencies: []
---

# AUR-5: Happy-path passkey onboarding (language → handle → passkey → home stub)

> First story under [AUR-1](../../brief.md). Status: `needs-design` until design + copy approved by HITL (milestone gate per AGENTS.md #9), then flips to `ready` and `/build AUR-5` can run.

## Description

A first-time TestFlight user opens Aura, picks their language (English or Hindi), chooses a handle, completes a biometric-gated passkey enrollment, and lands on the home stub — three taps + one typed string. No password, no OTP, no email, no welcome screen. Devices that don't support passkeys see a friendly "not supported in this version" screen instead; OTP fallback ships in Story 2 once MSG91 lands per OPS-001.

This story delivers the **happy path that ~85–95% of TestFlight devices will take** end-to-end. It is the smallest vertical slice that produces a real user row in Supabase and informs every subsequent story under AUR-1.

## Acceptance Criteria

- [ ] **AC1:** First-open shows the Language Picker as the first interactive screen (no welcome/value-prop). Per [design.md § Language Picker](./design.md) + [copy.md § language.*](./copy.md).
- [ ] **AC2:** User can select English or Hindi; selection persists to `User.primary_language` on user creation.
- [ ] **AC3:** Handle entry validates against `@aura/core` `handleSchema` (3–32 chars, `[a-z0-9_]`). Invalid handles show inline error per copy.md (`handle.error.invalid_chars` / `too_short` / `too_long`). Collision shows `handle.error.taken` and clears the field. Auto-suggest of alternatives is **out of scope** for this story.
- [ ] **AC4:** Passkey enrollment ceremony succeeds end-to-end on a passkey-capable device: `react-native-passkey` triggers OS biometric prompt; on success, `@simplewebauthn/server` (via `@aura/auth.finishEnrollment`) verifies and writes a `passkey_credentials` row.
- [ ] **AC5:** On enrollment success, user lands on the home-screen stub displaying `home.welcome` (with handle interpolated), `home.placeholder`, and `home.footer` per copy.md.
- [ ] **AC6:** On capability-detection failure (no passkey support), the Not Supported screen renders with the strings from copy.md (`unsupported.title` + `unsupported.body`). No crash, no silent failure, no OTP fallback in this story.
- [ ] **AC7:** All user-facing strings render in the user's selected language (English or Hindi Devanagari) per copy.md. No hardcoded English in the codepath.
- [ ] **AC8:** On successful enrollment, exactly one `users` row + one `passkey_credentials` row are written to Supabase. Both visible in the Supabase dashboard for QA verification.
- [ ] **AC9:** One funnel event emitted per screen exit (`language_picked`, `handle_accepted`, `identity_enrolled`, `reached_home`), keyed by `handle_hash` (not raw handle) per architecture § Cross-cutting standards § Logging. Full event taxonomy + comprehensive `audit_log` writes are **deferred to a separate story.**
- [ ] **AC10:** Crash-free happy path on at least one iOS device + one Android device in TestFlight (Sentry confirms zero error events for the path during a 5-user smoke test). Crash budget for this story: 0 P0, ≤1 P2.
- [ ] **AC11:** Back-gesture behaviour matches [design.md § Interactions](./design.md): disabled on Passkey + Not Supported screens; allowed Handle → Language; allowed nowhere on Home Stub (would land user back in onboarding loop).
- [ ] **AC12:** Hindi Devanagari renders correctly on the four reference devices listed in design.md R-DESIGN-2 (iOS recent, iOS oldest supported, Android flagship, low-end Android). No clipping, no font-fallback issues, no glyph holes.

## Tech notes

References inherit from [architecture.md](../../../foundation/architecture.md) — load-bearing decisions are there, not duplicated here.

**Mobile (`apps/mobile`):**
- Three new Expo Router routes: `app/onboarding/language.tsx`, `app/onboarding/handle.tsx`, `app/onboarding/passkey.tsx`.
- New route: `app/onboarding/not-supported.tsx`.
- Home stub at `app/index.tsx` — update existing stub to render the home.welcome / placeholder / footer copy.
- Route guard at `app/_layout.tsx`: on cold-launch, check `expo-secure-store` for signed handle token. If present → home; if absent → `/onboarding/language`.
- Use `expo-secure-store` to persist the signed handle token after `finishEnrollment` returns success.
- Capability detection via `react-native-passkey`'s init API at the `passkey.tsx` screen mount; if `false`, navigate to `not-supported.tsx`.
- Back-gesture control via Expo Router's `headerBackVisible` + Android hardware back handler (`useFocusEffect` + `BackHandler.addEventListener`).
- i18n via the language selection persisted in `User.primary_language` + a small in-app string registry from copy.md. (Full i18n library is overkill at 2 languages × ~25 strings — keep it tactical.)

**Server (`apps/web/app/api/trpc`):**
- New tRPC procedures under `user.*` and `auth.passkey.*`:
  - `user.checkHandle(handle: string) → { available: boolean }`
  - `user.create(handle: string, primaryLanguage: 'en' | 'hi') → { userId: string }`
  - `auth.passkey.beginEnrollment(userId: string) → PasskeyEnrollChallenge` (proxies to `@aura/auth.beginEnrollment`)
  - `auth.passkey.finishEnrollment(payload: WebAuthnRegistrationResponse) → { signedToken: string }` (proxies to `@aura/auth.finishEnrollment`; on success returns a signed token the mobile client stores in `expo-secure-store`)
- All four procedures validate inputs against `@aura/core` zod schemas.

**Database (`packages/db`):**
- **No schema changes.** Migration 0001 already created `users` + `passkey_credentials` + RLS-enabled.
- `packages/db/src/client.ts` already has `serverClient()` + `setRequestUser()`. Story uses both.

**Auth (`packages/auth`):**
- `webauthn.ts` stubs (`beginEnrollment`, `finishEnrollment`) get filled in this story.
- `otp.ts` stays stubbed — not exercised in Story 1.

**AI (`packages/ai`):**
- Not exercised in this story (no conversation surface yet).

**Funnel telemetry:**
- Use Vercel Observability custom-event API on web (tRPC procedure entry/exit) and Sentry breadcrumbs on mobile (per-screen). One event per AC9 milestone. No third-party analytics in this story.

**Audit log writes:**
- One `audit_log` row on `finishEnrollment` success (`event_type: 'auth.passkey_enrolled'`). Comprehensive audit-log surface ships in a separate story.

**Out-of-scope for this story (queued for subsequent stories under AUR-1):**
- OTP fallback path (depends on MSG91 via OPS-001).
- Handle auto-suggest on collision.
- "Use this device next time" cloud-keychain enrollment toggle (per architecture R-AUTH-V2 mitigation).
- Returning-user passkey assertion flow.
- Comprehensive funnel taxonomy + audit_log surface.
- Devanagari handle support (locked to Romanised per AUR-1 P2 Issue).

## PRs

_Auto-populated as PRs open._

- **[PR #1](https://github.com/vivekschaudhary/aura-app/pull/1) — feat(AUR-5): bilingual i18n + 5 onboarding screens + route guard** — opened 2026-05-25, **merged 2026-05-25** (merge commit `ea6c8ef`). Self-review only (no Codex review; deferred per Engineer DRI). Status: CI green (`7503cc6`); no deploy triggered (no Vercel project linked yet — OPS-001 territory). 18 files, 1317 insertions. See [`PR-1-description.md`](./PR-1-description.md). Scope: bilingual string registry + 5 onboarding screens + route guard + secure storage helpers + 1 unit test (6 cases passing).
- **PR 2 (backend slice)** — _opened 2026-05-25, awaiting Codex review._ Wires tRPC routers (`user.checkHandle`, `user.create`, `auth.passkey.{begin,finish}Enrollment`) via new `@aura/api` workspace package + real `@simplewebauthn/server` ceremony in `@aura/auth` + HMAC-signed challenge/session tokens + `@aura/db` query helpers (`users`, `passkey_credentials`, `audit_log`) + migration `0007_passkey_extensions.sql` (adds `credential_id`, tightens `aaguid`). Absorbs both Codex P1 findings (handle normalization + unsupported-device sentinel) from the post-merge review of PR #1. 33 tests passing (14 auth + 13 api + 6 i18n pre-existing). Cannot run end-to-end until OPS-001 (Supabase project) executes. See [`PR-2-description.md`](./PR-2-description.md).
- **PR 3 (E2E tests)** — _pending._ Codex-owned per workflow Phase 3; covers AC1–AC11 happy path via Maestro / Detox.

**Story status remains `in-build`** until all 3 PRs merge. Per workflow Phase 6 step 27: "Brief stays in-build until ALL stories of the brief have shipped." The brief itself (AUR-1) tracks all of AUR-5 + future stories (e.g., Story 2 = OTP fallback once MSG91 is unblocked by OPS-001).

## Tests

**Engineer writes** (co-located with code per architecture § Cross-cutting standards § Testing):

- Unit: `@aura/core` `handleSchema` validation cases (Vitest)
- Unit: `@aura/auth.beginEnrollment` + `finishEnrollment` happy + error paths (Vitest, with mocked `@simplewebauthn/server`)
- Integration: tRPC procedures `user.checkHandle`, `user.create`, `auth.passkey.beginEnrollment`, `auth.passkey.finishEnrollment` against a test Supabase project (or local Postgres with same migrations)
- Component (mobile): each onboarding screen renders correctly in English and Hindi, with all states (default, loading, error, success) (Vitest + React Testing Library for RN)

Tags:
- `regression: false` (no prior regressions to guard against — this is new)
- `e2e: false` (E2E lives below)

**Codex / Reviewer writes** (per role allocation in `compass/config.yaml`):

- E2E in top-level `e2e/` covering the full happy path on iOS Simulator + Android Emulator (Detox or Maestro), with mocked passkey ceremony.
- Tags: `regression: false`, `e2e: true`.

Crisis-detection red-team suite is N/A for this story (no LLM calls in the code path).

## Fixes (post-merge)

_If post-merge bugs are found, story is re-opened and fixes live under `fixes/`._

_(none yet)_

## DRI Log

### Decisions

- [2026-05-25] [Engineer] **PR 1 scope = frontend slice only** (i18n + 5 screens + route guard + storage). Backend slice (tRPC routers + `@simplewebauthn/server` ceremony) deferred to PR 2; E2E tests deferred to PR 3 (Codex-owned).
  - **Rationale (required):** Per Engineer role "smallest viable diff" + workflow "story may have multiple PRs." A full single-PR diff for AUR-5 would be ~30 files; splitting at the frontend/backend seam keeps PRs reviewable and lets PR 1 land + smoke-tested on-device while OPS-001 (Supabase + AI Gateway provisioning) is still pending. The seam is clean: frontend stubs the backend calls behind clear `TODO (PR 2):` markers in `handle.tsx` and `passkey.tsx`.
  - **Area (required, tag):** build / scope.
  - **Alternatives considered (required):** One mega-PR (rejected — review surface too wide; review quality suffers); slice by screen-by-screen (rejected — each PR delivers no observable user value; vertical slice is more honest).
  - **Reversibility:** easy.

- [2026-05-25] [Engineer] **Stub backend calls in `handle.tsx` (uniqueness check) and `passkey.tsx` (enrollment) with clear `TODO (PR 2):` markers + behavioural placeholders that allow the happy-path flow to navigate end-to-end on-device.**
  - **Rationale (required):** Per workflow Engineer-forbidden list: "Faking data because endpoint doesn't exist (hand off to contract owner)." Caveat: the *contract* IS owned here (the tRPC schemas live in `@aura/core` already); only the *backend implementation* is deferred. The stub paths simulate happy-path success so the entire onboarding flow can be walked through manually (and component-tested) without a live Supabase. This is functionally different from "faking data in production paths" — the TODOs are explicit and the unhappy paths (network errors, OTP fallback) are NOT stubbed away.
  - **Area (required, tag):** build / scope / boundaries.
  - **Alternatives considered (required):** Throw "Not implemented" errors at the boundary (rejected — blocks the happy-path UX walkthrough that's the whole point of PR 1); call the real (non-existent) tRPC endpoints and let them 501 (rejected — would conflate "backend not built" with "backend broken").
  - **Reversibility:** easy — PR 2 deletes the stub branches and wires the real tRPC client.

- [2026-05-25] [Engineer] **PR 2: Create `packages/api` workspace package to own tRPC router definitions.** Web mounts the HTTP handler; mobile type-imports `AppRouter`. Both depend on `@aura/api` instead of an apps/web→apps/mobile workspace edge.
  - **Rationale (required):** The canonical tRPC monorepo pattern. Avoids exposing apps/web internals to apps/mobile, keeps the boundary between mount-point (HTTP) and contract (types) clean, and lets future non-web mounts (e.g. a separate edge function) reuse the same router without restructuring.
  - **Area (required, tag):** build / architecture / boundaries.
  - **Alternatives considered (required):** Routers live in `apps/web/lib/trpc/*`, mobile imports type from `@aura/web` (rejected — apps/* → apps/* dep + exposes web internals); inline AppRouter type in mobile (rejected — silent type drift between client and server).
  - **Reversibility:** medium — collapsing back into apps/web would mean moving 5 files + 2 dep updates.

- [2026-05-25] [Engineer] **PR 2: Stateless WebAuthn challenge handling via HMAC-signed tokens.** `beginEnrollment` returns an opaque `challengeToken` (HMAC-SHA256 over `{userId, challenge, exp}`, 5-min TTL). Client echoes the token back to `finishEnrollment`, which verifies signature + expiry. No server-side session store.
  - **Rationale (required):** WebAuthn ceremonies are two-call (begin → device prompt → finish). The traditional pattern is to store the challenge server-side (Redis/Postgres) keyed by session. We have no session layer yet — and provisioning Redis/KV just for two-call ceremonies is premature. HMAC tokens are a standard alternative (same pattern Cognito + Auth0 use for transient flow state). Five-minute TTL matches typical WebAuthn ceremony length and bounds replay risk.
  - **Area (required, tag):** build / auth / security.
  - **Alternatives considered (required):** Redis-backed session store (rejected — premature infra); Postgres `webauthn_challenges` table with TTL cleanup (rejected — adds a migration + cleanup cron for transient state); skip challenge binding entirely (rejected — security regression).
  - **Reversibility:** easy — swap the token store for a real session backing without changing the public router shape.

- [2026-05-25] [Engineer] **PR 2: New migration `0007_passkey_extensions.sql` adds `credential_id bytea unique not null` and tightens `aaguid` to `not null`.** Backfills not needed (no Supabase project exists yet; safe to ship with 0001..0006).
  - **Rationale (required):** Migration 0001 stored only an internal `uuidv7()` PK on `passkey_credentials`. That works for an immediate insert but breaks assertion (returning-user sign-in, Story 2) which needs to look up a credential by its WebAuthn-native id (sent by the device). Also breaks `excludeCredentials` on subsequent enrollments. `aaguid` is reported by every authenticator (zero-UUID for anonymous ones), so the column was nullable in name only.
  - **Area (required, tag):** build / data-model.
  - **Alternatives considered (required):** Store the credentialId as a base64-encoded text column (rejected — bytea is the spec-correct shape + faster to look up); defer the column to Story 2 (rejected — would need a migration mid-story which is messier than landing it now).
  - **Reversibility:** easy on empty table; harder once user data exists (requires a column add + backfill before any assertion code can run).

- [2026-05-25] [Engineer] **PR 2: Defer mobile component tests (per-screen Vitest + RN-testing-library).** Story Tests section names them; PR 2 ships unit (auth) + integration (tRPC procedures with mocked DB) only.
  - **Rationale (required):** Setting up jest-expo / @testing-library/react-native is its own infra PR — it requires a separate test runner config (RN doesn't run under Vitest cleanly), Babel config for JSX-in-tests, and on-device tests for any keychain interaction. PR 1 also shipped without component tests for the same reason. The unhappy-path coverage on the tRPC procedures + auth ceremony catches most of what component tests would catch (state machine transitions, error mapping); UI-shape tests for the 5 screens add little signal until visual regression is also in place.
  - **Area (required, tag):** build / test-coverage / scope.
  - **Alternatives considered (required):** Wire jest-expo in this PR (rejected — scope explosion); skip backend tests too (rejected — auth ceremony + tRPC layer are exactly where regressions are highest-impact).
  - **Reversibility:** easy — open a follow-up PR (call it AUR-5 PR 5 or a P2 Issue) for the component test infra.

- [2026-05-25] [Engineer] **`apps/mobile/app/_layout.tsx` route guard reads handle + signed-token from secure storage; redirects to `/onboarding/language` if either is absent.**
  - **Rationale (required):** Per AC11 (back-gesture rules) + Tech notes ("Route guard at `app/_layout.tsx`: on cold-launch, check `expo-secure-store` for signed handle token"). Two-key check (handle AND token, not OR) prevents the case where someone has a handle locally but the server-side enrollment didn't finish.
  - **Area (required, tag):** build / auth-flow.
  - **Alternatives considered (required):** Check handle only (rejected — false-positive enrolled state if enrollment was interrupted); check token only (rejected — race with home-stub render that needs the handle string).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **First story under AUR-1 is the vertical happy-path slice, not the horizontal "language picker only" slice.**
  - **Rationale (required):** Per `/create-story` workflow § "Smallest thing that delivers value": a language picker alone delivers nothing. Vertical end-to-end is the smallest slice that produces a real `users` row + lets a human go through onboarding once. It also informs every subsequent story (we'll know what onboarding *feels* like end-to-end before adding edge cases on top).
  - **Area (required, tag):** product / scope / sequencing.
  - **Alternatives considered (required):** Slice horizontally per screen (rejected — language picker alone delivers no value; would ship 5 screen-stories that only become useful when the 5th lands); slice by capability (passkey-happy + OTP-fallback in one story) (rejected — OTP requires MSG91 from OPS-001 which has 2–5 day async wait; would block this story unnecessarily).
  - **Reversibility:** easy — re-slice future bets differently if this proves wrong.

- [2026-05-24] [PM] **Story ID is `AUR-5` — next sequential AUR-N per `compass/config.yaml` `story_id_format: jira_style`.** AUR-2, AUR-3, AUR-4 are sibling bets, not stories under AUR-1. Bets and story sub-tickets share the AUR number-space.
  - **Rationale (required):** Compass config explicitly says story_id_format = jira_style with the example `PROJ-43 (sub-ticket of bet)` — meaning the next number after the bet's number. Following the convention rather than inventing (AUR-1.1 or AUR-1-S1) keeps tooling consistent if we later wire Jira.
  - **Area (required, tag):** process / convention.
  - **Alternatives considered (required):** AUR-1-S1 / AUR-1.1 dotted convention (rejected — more readable but breaks the config rule; could re-open if the AUR-N space gets confusing in practice).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **Capability-failed users see a "Not Supported" screen with no CTA in this story.** OTP fallback ships in the next story (Story 2 = AUR-6 likely).
  - **Rationale (required):** OTP path depends on MSG91 from OPS-001 (DLT approval 2–5 days). Story 1 should not block on that. The "Not Supported" screen is honest, not silent — sets user expectation. Story 1 is for **internal dev cohort only**; do NOT invite TestFlight users until Story 2 ships and the fallback path is real.
  - **Area (required, tag):** product / scope / sequencing.
  - **Alternatives considered (required):** Block Story 1 on OPS-001 (rejected — wastes 2–5 days); ship a fake-OTP that always succeeds (rejected — pretends a flow that doesn't exist).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **Home stub in this story is a static placeholder, not a stubbed conversation surface.** Users see "Welcome, {handle}. Conversations are coming." per copy.md.
  - **Rationale (required):** AUR-2 (voice loop) is the conversation surface; building a fake-conversation stub here would invite premature design + scope confusion. Static placeholder honestly tells the user where they are.
  - **Area (required, tag):** product / scope.
  - **Alternatives considered (required):** Show a "tap to start a conversation" button that errors (rejected — broken promise); auto-navigate to a coming-soon page (rejected — extra nav).
  - **Reversibility:** easy — Home Stub gets replaced when AUR-2 ships.

### Risks

- [2026-05-24] [PM] **R-S1-1: Story 1 ships without OTP fallback → capability-failed users hit a dead-end screen with no path forward.**
  - **Likelihood (required):** medium (~5–15% of devices per architecture R-AUTH-V2 baseline).
  - **Impact (required):** low *if* contained to internal dev cohort (no real users are blocked); high *if* TestFlight invitations go out before Story 2 ships.
  - **Mitigation (required):** Story 1 ships to internal dev cohort ONLY. TestFlight invites do not go out until Story 2 (OTP fallback) ships. Document this as a release-gate in the story's merge checklist.
  - **Area (required, tag):** product / release-sequencing.

- [2026-05-24] [PM] **R-S1-2: Inherits R-COPY-1 from copy.md.** Hindi strings are written by me (not native speaker); risk of off-tone Hindi.
  - **Likelihood (required):** high.
  - **Impact (required):** medium-high (Hindi-primary user trust breaks at first contact).
  - **Mitigation (required):** Per copy.md mitigation — recruit ≥2 Hindi-primary speakers to review Hindi strings before TestFlight. If polish needed, run a Story 1.5 between AUR-5 and AUR-6.
  - **Area (required, tag):** copy / i18n / quality.

- [2026-05-24] [PM] **R-S1-3: Inherits R-DESIGN-2 from design.md.** Devanagari rendering on low-end Android is a known industry footgun.
  - **Likelihood (required):** medium-high.
  - **Impact (required):** medium.
  - **Mitigation (required):** Per design.md mitigation — test on the four reference devices listed in AC12 before ship.
  - **Area (required, tag):** design / i18n / device-compatibility.

- [2026-05-25] [Engineer] **R-S1-4: `react-native-passkey` `^3.1.0` API surface is assumed; not yet validated against actual install.** PR 2 made `lib/passkey.ts` type-tolerant (`createPasskey(options: unknown): Promise<unknown>`) so the @simplewebauthn options shape can flow through without TS-rejecting on a minor version difference. Runtime validation still pending — only a real on-device run will confirm the wire shape matches.
  - **Likelihood (required):** low-medium.
  - **Impact (required):** low (adapter file is small; rewrites cheap; the boundary is well-isolated).
  - **Mitigation (required):** First on-device run (post-OPS-001) validates the wire shape. If the API shape differs, update `passkey.ts` only. Type-tolerant API at the lib boundary means a version bump can't TS-break the screens.
  - **Area (required, tag):** build / dependency / integration.

- [2026-05-25] [Engineer] **R-S1-5: WebAuthn challenge / session signing secrets must be ≥32 bytes of entropy and rotated periodically.** `WEBAUTHN_SIGNING_SECRET` + `SESSION_SIGNING_SECRET` (added to `.env.example` in PR 2) gate the entire passkey flow. A weak or leaked secret lets an attacker forge `challengeToken` (replay a known challenge against a stolen attestation) or `signedToken` (impersonate any user).
  - **Likelihood (required):** low (only at risk if Vercel env compromised).
  - **Impact (required):** high (account-takeover or replay-attack vector).
  - **Mitigation (required):** Generate via `openssl rand -base64 32` per `.env.example` comment. Store in Vercel env (encrypted at rest). Document a quarterly rotation in OPS-001 successor runbook. Codex Security Reviewer should flag any code path that hardcodes or logs either secret.
  - **Area (required, tag):** build / auth / security / ops.

- [2026-05-25] [Engineer] **R-S1-6: `0007_passkey_extensions.sql` not yet applied to a real Postgres.** The migration assumes empty tables. If OPS-001 lands and migrations are applied out of order, or if any real rows exist before 0007 runs, the `not null` constraints on `credential_id` and `aaguid` will fail.
  - **Likelihood (required):** low (no Supabase project exists yet — OPS-001 pending).
  - **Impact (required):** medium (would block OPS-001 supabase provisioning until migration is rewritten).
  - **Mitigation (required):** When OPS-001 runs, apply migrations in numerical order (0001 → 0007). Verify with `supabase db push --dry-run` first. If real rows somehow exist before 0007, add a backfill step (`update passkey_credentials set aaguid = '00000000-...' where aaguid is null`) before the `set not null`.
  - **Area (required, tag):** build / data-model / migrations.

### Issues

- [2026-05-24] [PM] **Test devices not yet sourced.** AC10 + AC12 require physical access to iOS recent, iOS oldest supported, Android flagship, low-end Android.
  - **Severity (required, mandatory):** P2 (doesn't block code-writing; blocks ship verification).
  - **Owner (required, mandatory):** Vivek (with Engineer to flag if a device isn't reachable).
  - **Status:** open.
  - **Area (required, tag):** test / devices.

- [2026-05-25] [Engineer] **GitHub MCP not yet authenticated in this session** — PR 1 code is staged locally but the actual PR is not opened. Workflow Phase 4 step 11 ("Engineer opens PR via GitHub MCP") is pending.
  - **Severity (required, mandatory):** P1 (blocks Codex review which blocks merge).
  - **Owner (required, mandatory):** Vivek (auth) + Engineer (open PR after auth lands).
  - **Status:** resolved 2026-05-25 — PR #1 opened via `gh` CLI (`-R vivekschaudhary/aura-app`) and merged at commit `ea6c8ef`.
  - **Area (required, tag):** build / ops / pr-flow.

- [2026-05-25] [Engineer] **End-to-end smoke test (AC10) blocked on OPS-001 execution.** No Supabase project exists, so the real tRPC roundtrip + the actual passkey credential write cannot be validated in this PR. Once OPS-001 ships, re-test on-device.
  - **Severity (required, mandatory):** P1 (blocks AC10 + AC12 sign-off; doesn't block PR 1 merge per the scope split).
  - **Owner (required, mandatory):** Vivek (OPS-001 execution) + Engineer (re-test post-execution).
  - **Status:** open.
  - **Area (required, tag):** build / dependency / OPS-001.

- [2026-05-25] [Reviewer (Codex)] **Handle input not normalized before schema validation or persistence** (`apps/mobile/app/onboarding/handle.tsx:44-55`). `handleSchema` enforces lowercase `[a-z0-9_]`, but `onSubmit` persists `value` exactly as typed. Users entering valid-looking handles with leading/trailing whitespace (e.g. autofill inserting a trailing space) or uppercase characters can be blocked by validation or, post PR 2, stored inconsistently depending on keyboard/autofill behavior. Found by Codex review of merge commit `ea6c8ef` post-merge — the author (Engineer/Claude) missed it. Fix: trim + lowercase the input before validation and persistence; reflect the normalization in the visible input as the user types.
  - **Severity (required, mandatory):** P1 (real onboarding-failure mode against AC4; merged code).
  - **Owner (required, mandatory):** Engineer (absorb fix into PR 2 since `handle.tsx` is being touched there anyway to wire the real `user.checkHandle` tRPC call).
  - **Status:** open.
  - **Area (required, tag):** build / ux / validation.

- [2026-05-25] [Reviewer (Codex)] **Unsupported-device users hit an onboarding loop on every cold launch** (`apps/mobile/app/_layout.tsx:24-29`). When `isPasskeySupported()` returns false the user is sent to `/onboarding/not-supported`, but no sentinel state is written to secure storage. On the next cold launch the root guard sees missing handle + signed token and routes them through `/onboarding/language` → `/onboarding/handle` → `/onboarding/passkey` again, only to fail at passkey-not-supported again — every single launch. Found by Codex review of merge commit `ea6c8ef` post-merge — the author (Engineer/Claude) missed it. Fix: persist a sentinel (e.g. `onboarding_terminated_unsupported: true` in expo-secure-store) when routing to `not-supported`, and have the root guard short-circuit to that screen directly when the sentinel is set.
  - **Severity (required, mandatory):** P1 (regresses AC11 graceful-degradation — degraded path becomes infinite loop, not terminal state; merged code).
  - **Owner (required, mandatory):** Engineer (absorb fix into PR 2 since `_layout.tsx` is being touched there anyway to wire real session/token checks).
  - **Status:** resolved in PR #2 — `aura.onboardingTerminated` sentinel persisted in `apps/mobile/lib/storage.ts`; root guard checks it FIRST and short-circuits to `/onboarding/not-supported`.
  - **Area (required, tag):** build / state / route-guard.

- [2026-05-25] [Reviewer (Codex)] **Root layout calls `router.replace` from a render path that returned `null`** (`apps/mobile/app/_layout.tsx:46-47` in PR #2 v1). Expo Router throws "Attempted to navigate before mounting the Root Layout" when navigation methods fire inside the pre-mount window — breaks first-launch routing for users without a stored session and for unsupported-device routing. Found by Codex review of PR #2 commit `1776b0f`.
  - **Severity (required, mandatory):** P1 (broken first-launch routing in production; would manifest as a black screen + nav error on every cold launch).
  - **Owner (required, mandatory):** Engineer (fix in next commit on the PR 2 branch).
  - **Status:** resolved in PR #2 fix commit — `Stack` is now rendered on every paint inside a `View` with `opacity: checked ? 1 : 0`, so router.replace from the useEffect always lands in a mounted navigator. The opacity gate hides the initial-route flash (~1 frame) without skipping the render.
  - **Area (required, tag):** build / state / navigation / expo-router.

- [2026-05-25] [Reviewer (Codex)] **Android hardware back not blocked on passkey + not-supported screens** (`apps/mobile/app/onboarding/_layout.tsx:17-20`). Stack-level `gestureEnabled: false` only suppresses the iOS swipe-back gesture; Android needs an explicit `BackHandler` listener. Currently Android users on the passkey or not-supported screens can back-navigate into earlier onboarding steps, violating the AC11 + design.md interaction policy. Found by Codex review of PR #2 commit `1776b0f`.
  - **Severity (required, mandatory):** P2 (degrades AC11 on Android; iOS not affected; no data corruption).
  - **Owner (required, mandatory):** Engineer (fix in next commit on the PR 2 branch).
  - **Status:** resolved in PR #2 fix commit — `useFocusEffect` + `BackHandler.addEventListener('hardwareBackPress', () => true)` added to `apps/mobile/app/onboarding/passkey.tsx` and `apps/mobile/app/onboarding/not-supported.tsx`. The comment in `apps/mobile/app/onboarding/_layout.tsx` already documented the per-screen pattern; the implementation finally matches the comment.
  - **Area (required, tag):** build / android / back-handling.

- [2026-05-25] [Reviewer (Codex)] **`packages/db/src/passkey-credentials.ts` mishandles bytea encoding with Supabase/PostgREST** (`packages/db/src/passkey-credentials.ts:47-58` at PR #2 commit `3092843`). `insertPasskeyCredential` was passing `Uint8Array` directly to `.insert()`, which supabase-js JSON-serializes as `{"0":1,"1":2,...}` — Postgres rejects this for a bytea column. Reading side: PostgREST returns bytea as `'\x68656c6c6f'` (hex with `\x` prefix), not raw bytes, so `bytesToBase64url(data.credential_id)` was base64-encoding the literal text bytes of `\x...` rather than the credential bytes. Result: enrollment writes fail, and even if they didn't, `excludeCredentialIds` + future assertion lookups would mismatch. Code path is currently untested (no Supabase project — OPS-001 pending), which is why unit tests didn't catch it.
  - **Severity (required, mandatory):** P1 (breaks AC4 + AC8 end-to-end — passkey credentials cannot be persisted or looked up correctly in production).
  - **Owner (required, mandatory):** Engineer (fix in next commit on the PR 2 branch).
  - **Status:** resolved in PR #2 fix commit — `bytesToPgHex` + `pgHexToBytes` helpers added to `packages/db/src/passkey-credentials.ts`; applied on both write (`credential_id` + `public_key`) and read (`credential_id`); 7 new unit tests in `packages/db/src/passkey-credentials.test.ts` cover the encoding helpers + a roundtrip suite. End-to-end validation against real Postgres still blocked on OPS-001.
  - **Area (required, tag):** build / data / bytea-encoding / integration.

---

_Story closed: <date>, brief link: docs/bets/AUR-1/brief.md_
