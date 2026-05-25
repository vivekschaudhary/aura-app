# PR #2 — feat(AUR-5): backend slice (tRPC + WebAuthn ceremony + DB helpers) + 2 Codex P1 fixes

Closes the frontend stubs left in PR #1. The 5 onboarding screens now talk to a real Next.js + tRPC backend that verifies passkey enrollments via `@simplewebauthn/server` and writes the resulting `users` + `passkey_credentials` + `audit_log` rows to Supabase (when OPS-001 lands).

Also absorbs the two P1 findings Codex surfaced when reviewing PR #1 post-merge.

Links: [bet AUR-1 brief](../../brief.md) • [story AUR-5](./story.md) • [design](./design.md) • [copy](./copy.md) • [foundation architecture](../../../foundation/architecture.md)

## What changed

### New workspace package: `@aura/api`
The tRPC routers live here so both `apps/web` (mounts the HTTP handler) and `apps/mobile` (type-imports `AppRouter` for client inference) can depend on it without an apps/* → apps/* workspace edge. Canonical tRPC monorepo pattern.

- `packages/api/src/trpc.ts` — tRPC init with `superjson` transformer; exports `router`, `publicProcedure`, `createCallerFactory`, and a `requireAuth` middleware stub for Story 2.
- `packages/api/src/context.ts` — `createContext({ headers })` reads WebAuthn RP config + signing secrets from env. Tests pass an explicit override.
- `packages/api/src/routers/user.ts` — `user.checkHandle`, `user.create`.
- `packages/api/src/routers/auth-passkey.ts` — `auth.passkey.beginEnrollment`, `auth.passkey.finishEnrollment`.
- `packages/api/src/router.ts` — root router; exports `appRouter` + `type AppRouter`.

### `@aura/auth` — real WebAuthn ceremony
Replaced the `TODO: wire @simplewebauthn` stubs with real `generateRegistrationOptions` / `verifyRegistrationResponse` calls.

- `packages/auth/src/webauthn.ts` — real begin + finish ceremony. Returns/accepts WebAuthn-spec shapes from `@simplewebauthn/types`. UUID v7 user IDs are converted to bytes (v11 requires `Uint8Array`).
- `packages/auth/src/challenge-token.ts` — new. HMAC-SHA256-signed tokens carry `{userId, challenge, exp}` across the two-call ceremony so the server stays stateless (no Redis/KV needed yet). Same shape used for the session token returned by `finishEnrollment`. 5-min TTL on challenge, 30-day on session.

### `@aura/db` — query helpers
The boundary `apps/*` never crosses (per architecture § Boundaries — no direct `@supabase/supabase-js` imports outside this package).

- `packages/db/src/users.ts` — `checkHandleAvailability`, `insertUser`, `findUserById`, `hashHandle` (SHA-256, hex; for audit_log handle references per architecture logging standard).
- `packages/db/src/passkey-credentials.ts` — `insertPasskeyCredential`, `listCredentialIdsForUser`. base64url ↔ bytea conversions at the boundary.
- `packages/db/src/audit-log.ts` — `insertAuditLog`.
- `packages/db/schema/0007_passkey_extensions.sql` — **new migration.** Adds `credential_id bytea unique not null` to `passkey_credentials` (needed for assertion in Story 2 + `excludeCredentials` in begin ceremony). Tightens `aaguid` to `not null` (every authenticator reports one, zero-UUID for anonymous).

### `apps/web` — wires the HTTP handler
`app/api/trpc/[trpc]/route.ts` now mounts `appRouter` via `@trpc/server/adapters/fetch`. Node.js runtime (Fluid Compute) — `node:crypto` is used by `@aura/auth` for HMAC. Explicitly NOT Edge.

### `apps/mobile` — wires the screens to the real backend + Codex P1 fixes
- `lib/trpc.tsx` (new) — tRPC + React Query provider. `Authorization: Bearer <signedToken>` header sent if present (consumed by Story 2 procedures).
- `lib/env.ts` (new) — reads `EXPO_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3000`).
- `lib/storage.ts` — adds `getUserId/setUserId` + `getOnboardingTerminated/setOnboardingTerminated/clearOnboardingTerminated`.
- `lib/passkey.ts` — type-tolerant `createPasskey(options: unknown)`. See R-S1-4.
- `app/_layout.tsx` — wraps in `<TRPCProvider>`; route guard now checks the onboarding-terminated sentinel FIRST (Codex P1 #2 fix).
- `app/onboarding/handle.tsx` — input is trimmed + lowercased on every keystroke (Codex P1 #1 fix); submit calls `user.checkHandle` then `user.create` via tRPC; `CONFLICT` on `user.create` maps to the `handle.error.taken` UI state.
- `app/onboarding/passkey.tsx` — capability check writes the sentinel before redirecting to `/onboarding/not-supported`; real flow calls `beginEnrollment` → `Passkey.create(options)` → `finishEnrollment(challengeToken, attestation)` → persists returned session token.

### Codex P1 findings from PR #1 review — absorbed here
| Finding | File | Fix |
|---|---|---|
| P1: Handle not normalized before validation | `apps/mobile/app/onboarding/handle.tsx:44-55` | New `normalizeHandle(raw)` (trim + lowercase) called on every keystroke. |
| P1: Unsupported-device infinite loop | `apps/mobile/app/_layout.tsx:24-29` | New `onboardingTerminated` sentinel in expo-secure-store; root guard short-circuits to `/onboarding/not-supported` when set. |

### `.env.example`
New section: `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME` (default `Aura`), `WEBAUTHN_ORIGIN`, `WEBAUTHN_SIGNING_SECRET`, `SESSION_SIGNING_SECRET`, `EXPO_PUBLIC_API_BASE_URL`. Comment links to `openssl rand -base64 32` for secret generation. R-S1-5 logs the rotation requirement.

## AC mapping

| AC | Status after PR 2 | Notes |
|---|---|---|
| AC1 Language Picker first | ✅ (no change from PR 1) | |
| AC2 Language persists to `User.primary_language` | ✅ | `user.create` writes the row with `primary_language` column. |
| AC3 Handle validation + uniqueness | ✅ | tRPC `user.checkHandle` + `user.create` (with `CONFLICT` mapping). Codex P1 #1 (normalization) folded in. |
| AC4 Passkey enrollment ceremony succeeds end-to-end | ⏳ Code-complete; runtime blocked on OPS-001 | Real `@simplewebauthn/server` ceremony lives at `packages/auth/src/webauthn.ts`. Cannot smoke-test until Supabase exists. |
| AC5 Home stub with interpolated welcome | ✅ (no change from PR 1) | |
| AC6 Not Supported screen on capability failure | ✅ | Plus Codex P1 #2 sentinel — terminal state, no loop. |
| AC7 Bilingual rendering | ✅ (no change from PR 1) | |
| AC8 One users row + one passkey_credentials row written | ⏳ Code-complete; runtime blocked on OPS-001 | Inserts wired; can't smoke-test without Supabase. |
| AC9 Funnel events | ⛔ Out of PR 2 scope per tech-notes "Comprehensive funnel taxonomy + audit_log surface ships in a separate story." Only `user.created` + `auth.passkey_enrolled` audit_log rows are emitted. |
| AC10 Crash-free on iOS + Android TestFlight | ⏳ Blocked on OPS-001 + test devices | |
| AC11 Back-gesture rules | ✅ (no change from PR 1) | |
| AC12 Devanagari renders correctly on 4 reference devices | ⏳ Blocked on test devices | |

## Test plan

**Unit / integration tests (33 passing):**

```
@aura/core: 6 tests (i18n, pre-existing)
@aura/auth:
  - challenge-token.test.ts: 8 (roundtrip, bad secret, expired, malformed, tampered body, session token x3)
  - webauthn.test.ts: 6 (begin happy, begin error, finish happy, finish user-mismatch, finish bad-sig, finish unverified)
@aura/api:
  - user.test.ts: 7 (checkHandle available/taken/invalid, create happy/conflict/connection-error/invalid-lang)
  - auth-passkey.test.ts: 6 (begin happy/missing-user/ceremony-fail, finish happy/unauthorized/missing-user)
```

Run: `pnpm test`

**Manual smoke (blocked on OPS-001):**
- [ ] `pnpm dev` (web) + `pnpm start` (mobile) — full flow on iOS sim ending in `users` + `passkey_credentials` + `audit_log` rows visible in Supabase dashboard.
- [ ] Unsupported-device path on a non-passkey device — sentinel persisted, second cold launch goes straight to `/onboarding/not-supported`.
- [ ] Handle normalization — autofill a handle with trailing space → submit succeeds; capitalized handle → submit succeeds (server sees lowercase).

## Security review notes (for Codex Security Reviewer)

Diff touches auth + PII. Specifically:

- **Challenge-token signing** — HMAC-SHA256. Constant-time compare via `timingSafeEqual`. TTL bounded to 5 min. Token contents are NOT secret (just `userId + challenge`) but must be signature-verified before use. See R-S1-5.
- **Session token** — same shape; 30-day TTL. No procedure consumes it yet (Story 2 wires that); the header is sent if present and ignored if not. See R-S1-5.
- **Handle hashing for audit_log** — SHA-256, hex. Used as a stable identifier for the user that doesn't expose the handle itself in logs/metadata.
- **No conversation content** logged anywhere in this PR (no conversation surface yet — DPDPA principle).
- **No secrets in code or commits** — all secrets read from `process.env` at runtime. `.env.example` documents the required vars.
- **citext on `users.handle`** — case-insensitive uniqueness enforced at the DB layer. Mobile client also normalizes (trim + lowercase) so visible state is honest.

## Architect compliance check (for Codex Architect Review)

- ✅ `apps/*` does NOT import `@supabase/supabase-js` directly — all DB access via `@aura/db`.
- ✅ `apps/*` does NOT import `@simplewebauthn/*` directly — all ceremony via `@aura/auth`.
- ✅ Node.js runtime (Fluid Compute) on the tRPC route handler — `node:crypto` is used for HMAC.
- ✅ UUID v7 ids preserved (no new id-generation paths).
- ✅ Audit log writes use `entity_type + entity_id + actor_user_id` per migration 0001 schema.
- ✅ DPDPA: no conversation content; handle hashes (not handles) in audit metadata.

## Pre-existing risks revisited

- **R-S1-4 (`react-native-passkey` API surface):** `lib/passkey.ts` is now type-tolerant (`unknown` in, `unknown` out). On-device run still needed to validate the wire shape.
- **React 19 / RN 0.76 peer-dep mismatch:** still present, still deferred to a hygiene PR.

## New risks logged in story DRI

- R-S1-5 — WebAuthn signing secrets entropy + rotation.
- R-S1-6 — Migration 0007 assumes empty tables.

## Out of PR 2 scope

- **Mobile component tests (jest-expo + RN testing library)** — its own infra PR.
- **Real Supabase integration tests** — blocked on OPS-001.
- **Session token verification on tRPC procedures** — no procedure requires auth in PR 2; Story 2 wires this when returning-user assertion lands.
- **Funnel telemetry events (AC9)** — per AC9 deferral language.
- **"Check again" button on `/onboarding/not-supported`** — UX nicety; follow-up.

## Files

```
.env.example                                                             |  14 ++
.gitignore                                                               |   0
apps/mobile/app/_layout.tsx                                              |  rewritten
apps/mobile/app/onboarding/handle.tsx                                    |  rewritten
apps/mobile/app/onboarding/passkey.tsx                                   |  rewritten
apps/mobile/lib/env.ts                                                   |  new
apps/mobile/lib/passkey.ts                                               |  rewritten
apps/mobile/lib/storage.ts                                               |  +sentinel + userId helpers
apps/mobile/lib/trpc.tsx                                                 |  new
apps/mobile/package.json                                                 |  +@aura/api + @trpc/* + react-query + superjson + @types/node
apps/web/app/api/trpc/[trpc]/route.ts                                    |  rewritten (now thin)
apps/web/package.json                                                    |  +@aura/api + @trpc/server + superjson + zod
docs/bets/AUR-1/stories/AUR-5/PR-2-description.md                        |  this file (new)
docs/bets/AUR-1/stories/AUR-5/story.md                                   |  +DRI Decisions / Risks for PR 2
packages/api/package.json                                                |  new
packages/api/tsconfig.json                                               |  new
packages/api/src/context.ts                                              |  new
packages/api/src/index.ts                                                |  new
packages/api/src/router.ts                                               |  new
packages/api/src/routers/auth-passkey.test.ts                            |  new
packages/api/src/routers/auth-passkey.ts                                 |  new
packages/api/src/routers/user.test.ts                                    |  new
packages/api/src/routers/user.ts                                         |  new
packages/api/src/trpc.ts                                                 |  new
packages/auth/package.json                                               |  +@simplewebauthn/types + vitest + @types/node; -@aura/db
packages/auth/src/challenge-token.test.ts                                |  new
packages/auth/src/challenge-token.ts                                     |  new
packages/auth/src/index.ts                                               |  +challenge-token re-export
packages/auth/src/webauthn.test.ts                                       |  new
packages/auth/src/webauthn.ts                                            |  rewritten
packages/db/schema/0007_passkey_extensions.sql                           |  new
packages/db/src/audit-log.ts                                             |  new
packages/db/src/index.ts                                                 |  +new re-exports
packages/db/src/passkey-credentials.ts                                   |  new
packages/db/src/users.ts                                                 |  new
pnpm-lock.yaml                                                           |  regenerated
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)
