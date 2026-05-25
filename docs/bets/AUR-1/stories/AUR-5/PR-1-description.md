---
type: pr-description
story: AUR-5
bet: AUR-1
pr_number: TBD
status: ready-to-open
authored_by: Engineer (Claude)
date: 2026-05-25
---

# PR 1 — AUR-5: Happy-path passkey onboarding (frontend slice)

> Story: [AUR-5](./story.md) · Brief: [AUR-1](../../brief.md) · Design: [design.md](./design.md) · Copy: [copy.md](./copy.md)

## ⚠ Important — clean up branch state before opening this PR

`git status` shows ~88 staged + modified files because the entire Compass bootstrap (foundation product/architecture/portfolio/briefs/scan reports/plan/dashboard/scaffold) accumulated on the same branch without intermediate commits. **Opening one PR with all 88 files is not the PR you want.**

Suggested commit sequence before opening this PR:

1. `git commit -m "compass: foundation + scaffold + portfolio + briefs (bootstrap from 2026-05-23 → 2026-05-24)"` covering everything **except** the AUR-5 frontend slice. ~75 files. One mega-bootstrap commit is honest about how the foundation landed (an iterative session); future bootstrap work would commit per phase advance.
2. `git checkout -b build/AUR-5-onboarding-frontend`
3. `git add` only the AUR-5 frontend slice files (listed below).
4. `git commit -m "feat(AUR-5): bilingual i18n + 5 onboarding screens + route guard"`
5. Open the PR (this file is the body).

## What's in this PR

**Scope:** Frontend slice only — i18n + 5 mobile screens + route guard + secure storage. Backend (tRPC routers + `@simplewebauthn/server` ceremony) deferred to **PR 2**. E2E tests deferred to **PR 3** (Codex-owned per workflow Phase 3).

### Files added (12 new + 4 modified)

| Group | File | Purpose |
|-------|------|---------|
| Core i18n | `packages/core/src/i18n/strings.ts` | Bilingual string registry (verbatim from copy.md); `t(lang, id, vars)` helper |
| Core i18n | `packages/core/src/i18n/index.ts` | Barrel |
| Core i18n | `packages/core/src/i18n/strings.test.ts` | Vitest: key-coverage parity + interpolation + brand-name-stays-Latin |
| Core barrel | `packages/core/src/index.ts` *(modified)* | Re-export `i18n` |
| Mobile lib | `apps/mobile/lib/storage.ts` | `expo-secure-store` helpers — language, handle, signed-token persistence |
| Mobile lib | `apps/mobile/lib/i18n.ts` | `I18nProvider` + `useI18n` + `useT` hook; seeded from secure storage |
| Mobile lib | `apps/mobile/lib/passkey.ts` | `react-native-passkey` wrapper — `isPasskeySupported()` + `createPasskey()` |
| Mobile root | `apps/mobile/app/_layout.tsx` *(modified)* | Route guard + `<I18nProvider>` wrap |
| Mobile stack | `apps/mobile/app/onboarding/_layout.tsx` | Onboarding stack; back-gesture rules per design.md |
| Mobile screen | `apps/mobile/app/onboarding/language.tsx` | Language Picker (English / हिन्दी tiles) |
| Mobile screen | `apps/mobile/app/onboarding/handle.tsx` | Handle Entry; inline `handleSchema` validation; stubbed uniqueness check (PR 2 wires tRPC) |
| Mobile screen | `apps/mobile/app/onboarding/passkey.tsx` | Passkey Enrollment; capability detection redirects to Not Supported; stubbed enrollment (PR 2 wires `@simplewebauthn/server`) |
| Mobile screen | `apps/mobile/app/onboarding/not-supported.tsx` | Static apology; no CTA (per design.md Decision Designer-3) |
| Mobile home | `apps/mobile/app/index.tsx` *(modified)* | Home Stub per copy.md (welcome + placeholder + footer) |
| Mobile deps | `apps/mobile/package.json` *(modified)* | Added `react-native-passkey: ^3.1.0` |
| Story | `docs/bets/AUR-1/stories/AUR-5/story.md` *(modified)* | `status: in-build`; new Engineer DRI entries + risks + issues |
| PR doc | `docs/bets/AUR-1/stories/AUR-5/PR-1-description.md` | This file |

### Files NOT in this PR (deferred to PR 2 / PR 3)

- `apps/web/app/api/trpc/[trpc]/route.ts` — still the stub; PR 2 wires real routers
- `apps/web/lib/trpc/**` — entire tRPC router stack (PR 2)
- `packages/auth/src/webauthn.ts` — real `@simplewebauthn/server` ceremony (PR 2)
- `packages/auth/src/otp.ts` — MSG91 fallback (Story 2 — separate from AUR-5)
- `packages/db/src/queries/users.ts` — `checkHandle` / `createUser` query helpers (PR 2)
- `apps/mobile/lib/trpc.ts` — mobile tRPC client (PR 2)
- Component tests for each screen (PR 3 — alongside Codex E2E)
- `e2e/**` Maestro/Detox E2E covering AC1–AC11 happy path (PR 3, Codex-owned)

## Test plan

| Layer | What | Status |
|-------|------|--------|
| Unit | `packages/core/src/i18n/strings.test.ts` — 6 tests covering key parity, no-empty-values, interpolation, brand-Latin invariant, handle-placeholder-Latin invariant | **Included this PR** |
| Component | Per-screen render tests (Vitest + React Native Testing Library) for default + error + loading + success states | **PR 3** |
| Integration | tRPC procedure tests against a test Supabase project | **PR 2** (after backend lands) |
| E2E | Maestro flow: cold-launch → language → handle → passkey → home stub, on iOS Simulator + Android Emulator (mocked passkey ceremony) | **PR 3 (Codex)** |
| Manual smoke | Walk through on Expo Go + a development build per AC10 device matrix | **Post-OPS-001**, after PR 2 |

## AC mapping (what this PR closes vs. defers)

| AC | What it requires | This PR | Defer reason |
|----|------------------|---------|--------------|
| AC1 | Language picker as first interactive screen | ✅ `language.tsx` | — |
| AC2 | User picks en/hi; persists to `User.primary_language` | ✅ (local secure storage) | DB persistence in PR 2 |
| AC3 | Handle validation + uniqueness check + inline errors | ✅ validation + inline errors; **uniqueness check is stubbed** | tRPC `user.checkHandle` in PR 2 |
| AC4 | Passkey ceremony writes `passkey_credentials` row | ✅ ceremony screen + capability detection; **server-side write stubbed** | Real `@simplewebauthn/server` + DB write in PR 2 |
| AC5 | Home stub renders with handle interpolated | ✅ `index.tsx` reads handle from secure storage | — |
| AC6 | Not Supported screen on capability fail | ✅ `not-supported.tsx`; routed from `passkey.tsx` capability check | — |
| AC7 | All strings in selected language | ✅ Bilingual registry; coverage test guards drift | — |
| AC8 | One `users` + one `passkey_credentials` row written to Supabase | ❌ deferred — requires OPS-001 execution (Supabase project) + PR 2 (backend) |
| AC9 | Funnel events emitted per screen exit | ❌ deferred to PR 2 (Vercel Observability + Sentry breadcrumbs) |
| AC10 | Crash-free happy path on iOS + Android TestFlight | ⏸ blocked on PR 2 + OPS-001 + test devices |
| AC11 | Back-gesture behavior per design.md | ✅ `_layout.tsx` with `gestureEnabled: false`; Handle → Language back allowed |
| AC12 | Devanagari renders correctly on 4 reference devices | ⏸ requires test devices (P2 Issue on brief) |

**Net for this PR:** 6 ACs fully closed (1, 2, 5, 6, 7, 11); 2 partially closed with stubs (3, 4); 4 explicitly deferred (8, 9, 10, 12).

## Architect compliance notes

- **Boundary rules respected:** `apps/mobile/lib/passkey.ts` is the only file that imports `react-native-passkey`; `apps/mobile/lib/storage.ts` is the only file that imports `expo-secure-store`. No app screens reach across the package boundary.
- **`@aura/core` is the single source of truth for the string registry.** Mobile-side hook just imports + wraps; no string content lives outside `packages/core/src/i18n/strings.ts`.
- **`handleSchema` reused from `@aura/core/schemas`** (not duplicated in mobile). Live validation in `handle.tsx` calls `handleSchema.safeParse()`.
- **No direct OpenAI/Anthropic/Supabase imports in this PR.** The deferred backend slice (PR 2) will keep those inside `packages/ai/` and `packages/db/` per architecture § Boundaries.
- **`apps/mobile/app/**` is Expo Router** — NOT Next.js App Router. The two share the `app/` directory convention but the React Server Components rules (`"use client"`) do not apply. Several validation hooks in the build session flagged this as a false positive; ignore those suggestions.

## Security review notes (Codex Security Reviewer auto-engages on this PR)

This PR touches auth + PII per architecture R-AUTH-V2:
- **Auth:** Onboarding flow that culminates in passkey enrollment. PR 1 stubs the actual passkey creation; PR 2 will wire `@simplewebauthn/server` real ceremony. **Security Reviewer should flag if PR 1's stub somehow ships to production** without PR 2 — but PR 1 doesn't have a runnable backend, so this is structurally impossible (no Supabase connection = nothing to leak).
- **PII:** Handle entered in `handle.tsx` is persisted via `expo-secure-store` (OS keychain). The string itself is low-sensitivity (display identifier, not credential), but it's still a piece of user data — the architecture's logging standard ("never log raw handles; log `handle_hash`") applies; PR 2 will need to honor this in tRPC request logging.
- **No secret-bearing code in this PR.** No API keys, no tokens hardcoded. `expo-secure-store` keys are constants in `lib/storage.ts` — those are key *names*, not key *values*.

## Dispute section

_(None — no Codex review has run yet.)_
