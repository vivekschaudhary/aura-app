> **Status:** In-build. Pre-TestFlight. Not yet inviting users. Foundation + first feature bet (onboarding) partially shipped; production-deployed backend, on-device validation green on iOS in Hindi.

# Aura

> A vernacular, mobile-first AI counsel for the 536 million underserved Indians who have never had a mentor or trusted guide.

## What Aura is

Aura is a voice-first reflective-counsel app built for users who think in their language — not English-first, not chat-first, not advice-first. The product hypothesis: if a user can speak in Hindi (later: 5 more Indian languages) and get back a *reflective question* — not a fix — over a persistent memory of their life, they reach a clarity moment they would otherwise pay ₹500–2000 to a coach for, or never reach at all.

Three product principles shape every decision:

- **Reflective questioning over advice.** Aura doesn't tell users what to do. It listens and asks the next question. Failure mode worth avoiding: chatbot-as-life-coach drift.
- **Persistent memory over per-session chat.** The user's story compounds across sessions. This is the primary moat — switching cost grows with each interaction.
- **Anti-engagement.** Aura succeeds when a user reaches clarity and goes back to their life. Inverse of Replika / Character.AI / TikTok engagement-maximization. "Cursor for users — hoping they don't use as much."

Free at the user level in v1 (no per-user price until 100K WAR). Architectural cost ceiling: ≤ ₹20 per Weekly Active Reflector per month.

## Status

- **FOUNDATION-PRODUCT v2** — approved
- **FOUNDATION-ARCHITECTURE v1** — approved (amended for Sarvam AI speech provider)
- **MVP-PORTFOLIO v1** (4 bets: AUR-1 onboarding, AUR-2 voice loop + safety, AUR-3 memory moat, AUR-4 multi-conversation) — approved
- **AUR-1 onboarding** — in-build. PR #1 (frontend) + PR #2 (backend) merged. AUR-5 story end-to-end smoke-tested on iOS device against live Vercel + Supabase backend in Hindi.
- **OPS-001** — partial-shipped. Supabase (`ap-south-1`) + Vercel (`bom1`) + AI Gateway live. Sentry + Sarvam + MSG91 deferred with DRI Decisions.
- **AUR-2 / AUR-3 / AUR-4** — portfolio stubs, not promoted.

Live deployment: `https://aura-web-kind-tree.vercel.app` (web API surface; mobile is local-only until EAS dev build).

## Tech stack

A TypeScript monorepo on Vercel + Supabase, with passkey-primary identity, vernacular voice via Sarvam AI, and a persistent-memory data model in Postgres + pgvector.

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | Turborepo + pnpm | `node-linker=hoisted` (RN compat) |
| Web / API | Next.js 16 App Router on Vercel (region `bom1`) | Fluid Compute (Node runtime, not Edge) |
| Mobile | Expo SDK 52 / React Native 0.76 | Expo Router; EAS Build for native binaries |
| Database | Supabase Postgres 16 + pgvector + Storage (region `ap-south-1`) | UUID v7 ids, RLS enabled, custom plpgsql `uuidv7()` (R-OPS-2 fallback) |
| Contracts | tRPC for mobile↔server; Server Actions for web↔server | `@aura/api` workspace owns routers |
| Auth | Passkey-primary (WebAuthn synced, biometric-gated) + SMS OTP fallback | `@simplewebauthn/server` + `react-native-passkey` |
| AI orchestration | Vercel AI Gateway → Anthropic Claude + OpenAI | Per-turn model routing; Zero Data Retention enabled |
| Vernacular speech | Sarvam AI (ASR + TTS) | AI4Bharat OSS retained as DR fallback |
| Crisis safety | Synchronous classifier in every conversation turn | Tele-MANAS (`14416`) escalation card |
| Observability | Vercel Observability + AI Gateway dashboard | Sentry deferred until post-50-user cohort |
| Deployment | Vercel (web) + EAS (mobile) | India data residency by infrastructure constraint |

The whole stack is region-pinned to India (DPDPA-compliant from byte one).

## Repo structure

```
apps/
├── web/          Next.js 16 — hosts the tRPC handler at /api/trpc/[trpc]
│                 marketing stub at /, health at /api/health
└── mobile/       Expo SDK 52 — onboarding flow + (future) voice loop

packages/
├── api/          @aura/api  — tRPC routers (canonical monorepo pattern)
├── auth/         @aura/auth — WebAuthn ceremony + HMAC challenge tokens + MSG91 OTP
├── core/         @aura/core — domain types, zod schemas, safety keywords, i18n strings
├── db/           @aura/db   — Supabase client + query helpers (the ONLY supabase-js consumer)
├── ai/           @aura/ai   — AI Gateway client + speech + memory + safety stubs
└── config/       @aura/config — shared tsconfig + eslint base

docs/
├── foundation/   FOUNDATION-PRODUCT v2 + FOUNDATION-ARCHITECTURE v1 + portfolio + research
├── bets/         Per-bet docs: brief, architecture, stories, scan reports
│   └── AUR-1/    Onboarding (in-build); story AUR-5 lives here
├── ops/          Non-code ops changes (OPS-001 etc.)
├── status.md     Rolling project status — current state of every in-flight bet
└── changelog.md  Keep-a-Changelog format; finalizes per bet ship

compass/          Compass framework workflows + roles + templates (see "About Compass")
.claude/          Claude Code skill wrappers (1:1 with compass workflows)
.codex/           OpenAI Codex CLI wrappers
```

## Getting started

### Requirements

- Node.js 24+ (`.nvmrc` pinned)
- pnpm 9+ (via `corepack`)
- macOS for iOS development (Xcode + iOS Simulator)
- Android Studio for Android emulator (optional)

### Install

```bash
corepack enable
corepack prepare pnpm@9 --activate
pnpm install --frozen-lockfile
```

### Environment variables

Copy `.env.example` to `.env.local` and populate. Required vars are documented in the example file. For local development you need at minimum:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` — Supabase project
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway (for AUR-2 work; not needed for AUR-1 onboarding)
- `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN`, `WEBAUTHN_SIGNING_SECRET`, `SESSION_SIGNING_SECRET` — HMAC secrets, generate via `openssl rand -base64 32`

Mobile-side: `apps/mobile/.env.local` needs `EXPO_PUBLIC_API_BASE_URL` pointing at the running web app (`https://your-vercel-url.vercel.app` for deployed, `http://localhost:3000` for local).

### Run locally

```bash
pnpm typecheck       # all 7 packages
pnpm test            # 40 unit/integration tests across @aura/auth, @aura/api, @aura/db, @aura/core
pnpm --filter web dev          # Next.js dev server on :3000
pnpm --filter mobile start     # Expo dev server; press `i` for iOS sim, `a` for Android
```

### Database

Migrations live in `packages/db/schema/` (numbered SQL files `0001`–`0007`). Apply by concatenating and running against your Supabase project's SQL editor, or via the Supabase CLI (`packages/db` has it as a devDep — `pnpm --filter @aura/db exec supabase db push`).

## Documentation map

The documentation IS the design artifact. Read in this order:

1. [`docs/foundation/product.md`](docs/foundation/product.md) — Vision, personas, north-star metric (WAR), guardrails, OKRs, defensibility
2. [`docs/foundation/architecture.md`](docs/foundation/architecture.md) — Stack decisions, fitness functions, foundational data model, DRI log of architectural decisions + risks
3. [`docs/foundation/portfolio.md`](docs/foundation/portfolio.md) — The 4-bet MVP wedge + dependency graph + parallel-build candidates
4. [`docs/bets/AUR-1/`](docs/bets/AUR-1/) — Onboarding bet (in-build). [`stories/AUR-5/`](docs/bets/AUR-1/stories/AUR-5/) has the first shippable slice.
5. [`docs/ops/OPS-001.md`](docs/ops/OPS-001.md) — Foundational account provisioning runbook (partial-shipped)
6. [`docs/status.md`](docs/status.md) — Rolling status of every in-flight bet

Every artifact carries a DRI log section with Decisions / Risks / Issues — each entry has rationale, alternatives considered, mitigations, owners. **This is where the project's reasoning lives.**

## About Compass (the framework)

This repo was built using [Compass](https://github.com/vivekschaudhary/compass), a markdown-based product-development framework that any AI tool can read. Compass shaped this repo's discipline:

- **Every initiative is a bet** with a hypothesis, key metric, and an outcome (won / learning / inconclusive).
- **Decisions, Risks, Issues** logged at every stage in a per-artifact DRI section.
- **Roles, not job titles.** Claude played PM / Architect / Engineer / UX Writer / Designer / Researcher / Tech Writer at different phases. Codex (separate model, deliberately) played Reviewer + Security Reviewer.
- **Discipline holds always.** Full Codex review on every PR including drafts and hotfixes.

The framework itself lives in [`compass/`](compass/) (workflows, roles, templates) and is invoked via slash-commands like `/setup-product`, `/create-brief`, `/build`, `/scan`. Tool-specific wrappers in [`.claude/`](.claude/) and [`.codex/`](.codex/) point at the same source of truth.

If you're reading the repo to understand *what was built*, read the docs in `docs/`. If you're reading the repo to understand *how the work was structured*, read `compass/` + the DRI logs.

## Contributing

Single-author repo at this stage. Issue / PR contributions are not being solicited yet; the work is being structured to invite collaboration later.

If you're evaluating Aura as a project, the best surface to read is `docs/foundation/` for the strategic thinking and [`docs/bets/AUR-1/stories/AUR-5/story.md`](docs/bets/AUR-1/stories/AUR-5/story.md) for the level of empirical validation that's been done — the DRI log on that story is a worked example of how the framework's discipline tracks every decision + risk + caught bug.

## License

Private. All rights reserved.
