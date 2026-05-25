# Changelog

User-visible changes. One entry per shipped bet (not per PR — PRs accumulate, finalize when brief ships).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **[AUR-1] Onboarding flow (in-build)** — passkey-primary identity creation with handle + language picker. Accumulated across two PRs of story [AUR-5](../docs/bets/AUR-1/stories/AUR-5/story.md):
  - **PR #1 (merged 2026-05-25):** Five Expo Router onboarding screens (Language Picker → Handle Entry → Passkey Enrollment → Not Supported → Home Stub). Bilingual string registry (English + Hindi Devanagari) with `t(id, vars)` helper and 24 string IDs. Route guard on cold-launch via `expo-secure-store`. Stubs for the backend calls so the happy-path UX walks end-to-end without a live server.
  - **PR #2 (merged 2026-05-25):** Real backend wired. New `@aura/api` workspace package owns the tRPC routers (`user.checkHandle`, `user.create`, `auth.passkey.{begin,finish}Enrollment`). `@aura/auth` runs real `@simplewebauthn/server` ceremony with stateless HMAC-signed challenge + session tokens. `@aura/db` exposes query helpers for `users`, `passkey_credentials`, and `audit_log` (architecture-boundary-correct — `apps/*` never touches `@supabase/supabase-js`). Migration `0007_passkey_extensions.sql` adds `credential_id` (needed for assertion + `excludeCredentials`) and tightens `aaguid` to `not null`. Mobile `handle.tsx` normalizes input (trim + lowercase); `_layout.tsx` short-circuits to `not-supported` via secure-store sentinel for unsupported devices; passkey + not-supported screens block Android hardware back via `BackHandler`.
- Two new env vars: `WEBAUTHN_SIGNING_SECRET` + `SESSION_SIGNING_SECRET` (HMAC-SHA256, generate via `openssl rand -base64 32`).
- Test surface: 40 tests across `@aura/core` (i18n), `@aura/auth` (challenge-token + webauthn ceremony), `@aura/db` (bytea encoding helpers), `@aura/api` (tRPC procedure wiring with mocked DB).

### Changed
- `@aura/auth` no longer depends on `@aura/db` — the package boundary now matches the architecture decision (auth runs ceremony, doesn't persist).
- `apps/web/app/api/trpc/[trpc]/route.ts` is now a thin mount over `@aura/api`'s `appRouter` via `@trpc/server/adapters/fetch`. Node.js runtime (Fluid Compute), not Edge.

### Fixed
- Codex post-merge review of PR #1 surfaced two P1 bugs in shipped code; both absorbed into PR #2:
  - Handle input was not normalized before validation — autofill trailing spaces / capital letters silently failed `handleSchema`.
  - Unsupported-device path was an infinite onboarding loop on cold launch — no sentinel persisted, root guard kept re-routing the user through onboarding only to fail at passkey-not-supported every launch.
- Codex review of PR #2 (3 passes) surfaced four additional issues, all fixed in-PR before merge:
  - **P1** Root layout called `router.replace` from a render path that returned `null` (Expo Router "navigate before mounting Root Layout"). Stack now mounts on every paint behind an opacity gate.
  - **P2** Android hardware back was not blocked on passkey + not-supported screens (stack-level `gestureEnabled: false` is iOS-only). `useFocusEffect` + `BackHandler` added per restricted screen.
  - **P1** Supabase bytea encoding bug in `@aura/db/passkey-credentials.ts` — `Uint8Array` was being JSON-serialized as `{"0":1,"1":2,...}` on insert and `'\x...'` text was being base64-encoded as literal bytes on read. Both directions now go through `bytesToPgHex` / `pgHexToBytes` helpers with 7 dedicated roundtrip tests.

### Deprecated
-

### Removed
-

### Security
- Established the WebAuthn ceremony pattern for the project: stateless HMAC-signed challenge tokens (5-min TTL) replay-protected by signature verification, session tokens (30-day TTL) for future authenticated procedures. No conversation content or raw handles in logs/audit metadata (handle hashes only) — DPDPA-compliant from first byte.

<!--
When a brief ships:
1. Move accumulated entries from Unreleased into a versioned section below
2. Start a fresh Unreleased section
3. Sprint comms (docs/sprints/<year>/sprint-<n>.md) lists all briefs shipped that sprint
-->
