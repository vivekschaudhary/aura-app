# Project Status

_Last updated: 2026-05-26 (OPS-001 closed partial — Supabase + Vercel + AI Gateway provisioned; Sentry + Bhashini + MSG91 deferred; AUR-5 end-to-end smoke unblocked)._

## In flight

- **AUR-5** (first story under AUR-1) — Happy-path passkey onboarding: language → handle → passkey → home stub. Status: `in-build`. **PR #1 merged 2026-05-25** (frontend slice, squash `ea6c8ef`). **PR #2 merged 2026-05-25** (backend slice, squash `7ce397c`). 40 tests passing. **AUR-5 end-to-end smoke now unblocked** — Supabase + Vercel + AI Gateway live (OPS-001 partial). Next: manual on-device walkthrough against `https://aura-web-kind-tree.vercel.app` to validate AC4 + AC8 + AC10. PR #3 (Codex-owned E2E suite per workflow Phase 3) is the remaining open work before AUR-5 ships. See [`docs/bets/AUR-1/stories/AUR-5/`](./bets/AUR-1/stories/AUR-5/).
- **AUR-1** — Onboarding bet. Status: `approved`. First story (AUR-5) ready for build; Story 2 (OTP fallback) blocked on MSG91 via OPS-001.
- **MVP-PORTFOLIO v1** — Status: `approved`. AUR-1 in active development; AUR-2/AUR-3/AUR-4 still stubs.
- **OPS-001** — Status: **partial-shipped** (2026-05-26). Supabase (ap-south-1) + Vercel (`aura-web` + region pin) + AI Gateway (Anthropic + OpenAI + ZDR) live; 5 secrets in Vercel env. Sentry deferred to post-50-user cohort; Bhashini deferred to AUR-2 promotion; MSG91 deferred to public-store launch / Story 2 of AUR-1. All deferrals logged as DRI Decisions in `docs/ops/OPS-001.md`. R-OPS-2 (pg_uuidv7 unavailable) resolved via plpgsql `uuidv7()` in migration 0001.

## Awaiting human approval

_None._

## MVP bet stubs (portfolio_stub: true until /create-brief promotion)

| Bet ID | Title | Depends on | Parallel with |
|--------|-------|------------|---------------|
| [AUR-1](./bets/AUR-1/brief.md) | Onboarding — passkey + handle + language picker (en, hi) | — | — |
| [AUR-2](./bets/AUR-2/brief.md) | Core voice reflection loop + crisis safety | AUR-1 | — |
| [AUR-3](./bets/AUR-3/brief.md) | Persistent memory layer (the moat) | AUR-1, AUR-2 | AUR-4 |
| [AUR-4](./bets/AUR-4/brief.md) | Multi-conversation sidebar | AUR-1, AUR-2 | AUR-3 |

## Recently shipped

- **FOUNDATION-PRODUCT v1** approved 2026-05-23; superseded by v2 on 2026-05-24.
- **FOUNDATION-PRODUCT v2** approved 2026-05-24 (Vivek). Path A: free at user level in v1; deferred pricing decision to post-100K WAR; clarified ≤₹20 is the architectural cost ceiling, not a user price.
- **FOUNDATION-ARCHITECTURE drafts (2 prior rejected)** — 1st draft rejected 2026-05-23 (missing fitness functions / per-pillar scoring). 2nd draft rejected 2026-05-24 (missing Foundational Data Model section after role update).
- **FOUNDATION-ARCHITECTURE v1** approved 2026-05-24 (Vivek). TS monorepo on Vercel + Supabase; Expo mobile; passkey auth; Vercel AI Gateway → Claude + OpenAI; Bhashini speech. Foundational Data Model derived from product v2 (10 entities traced); multi-conversation as persistent threads; v1 launch languages English + Hindi.
- **FOUNDATION-ARCHITECTURE Phase B scaffold** completed 2026-05-24 — 45 files written + `compass/config.yaml` updated with `stack:` and `launch_languages:` sections. Repo skeleton is ready for `pnpm install` and first feature bet.

## Written-files summary (Phase B — 2026-05-24)

| Group | Count | Notes |
|-------|------:|-------|
| Root | 9 | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `vercel.ts` (region `bom1`), `.gitignore`, `.nvmrc`, `.env.example`, `tsconfig.json`, `.vercelignore` |
| `@aura/config` | 5 | Shared tsconfig (base / nextjs / expo) + eslint |
| `@aura/core` | 5 | Domain types, zod schemas, crisis-keyword seed list |
| `@aura/ai` | 7 | AI Gateway client, prompts, memory, safety, speech stubs (provider/model strings, no provider SDKs) |
| `@aura/db` | 4 | Supabase server client + tsconfig + barrel |
| `@aura/auth` | 4 | WebAuthn ceremony stubs + MSG91 OTP fallback stubs |
| DB migrations | 6 | Real SQL: 0001 init (users, passkey_credentials, audit_log, language_v1 enum, RLS), 0002 conversations + turns (with title, last_active_at), 0003 memories + pgvector HNSW, 0004 safety (crisis_flags, escalation_events — immutable), 0005 ratings + clarity_moments, 0006 language enum sanity check |
| `apps/web` | 8 | Next.js 16 App Router: layout, (marketing), (admin), trpc route, health route, configs |
| `apps/mobile` | 6 | Expo SDK 52+: app.config.ts, eas.json, Expo Router stub, configs |
| CI | 2 | `.github/workflows/ci.yml`, `.github/workflows/eas-preview.yml` |
| Config | 1 | `compass/config.yaml` updated with `stack:` section + `launch_languages:` |
| **Total** | **57** | (45 new files + 6 SQL migrations counted separately + 1 config update + DRI updates already reflected in architecture.md) |

## Blockers

- **P1 Issues from architecture (still open):**
  - Vercel project (`bom1`), Supabase project (`ap-south-1`), AI Gateway provider keys, MSG91 account, Bhashini API keys not yet provisioned → blocks first end-to-end dev environment but does NOT block bet creation.
  - Crisis-detection model + Tele-MANAS escalation rules → required before first user-facing release, not before first bet.
- **P1 Issue from product v2 (still open):** funding plan for 0→100K WAR free-burn phase not committed in writing (Q3 OKR KR4). Required before first user-facing release.

## Blockers

- `/create-brief` blocked until FOUNDATION-ARCHITECTURE Phase A approved AND Phase B scaffold complete.
- **P1 open Issue from product v2:** funding plan for 0→100K WAR free-burn phase not yet committed in writing (Q3 OKR KR4). Architecture HITL can proceed; first user-facing release should not without this.

## Risks

- R6 (high/high — new in product v2): Free-with-deferred-pricing burn risk during 0→100K WAR; funding plan required (Q3 OKR KR4).
- R-AUTH-V2 (med/med — new in architecture, replacing R-AUTH): Passkey fallback cohort (~5–15% of users) on SMS OTP retains conventional ATO surface; cloud-keychain sync enrollment matters.
- See foundation docs § DRI Log → Risks for full set.

## Risks

- R1 (high/high): Informal-sector persona unvalidated by desk research — qualitative work required in Q3.
- R3 (med/high): Sub-₹20/mo unit economics require open-source India AI stack discipline.
- See `docs/foundation/product.md` § DRI Log → Risks for full set.

## Health

_Run `/status` to populate metrics._
