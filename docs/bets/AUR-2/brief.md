---
id: AUR-2
type: feature
status: proposed
priority: P0
parent: FOUNDATION-PRODUCT
portfolio_stub: true
depends_on: [AUR-1]
parallel_with: []
architecture_required: auto
created: 2026-05-24
author: PM
sources:
  - docs/foundation/portfolio.md
key_metric:
  name: <to be defined on /create-brief promotion — likely: % of conversations producing ≥3 turns AND ending explicitly OR producing a clarity moment (the WAR-qualifying event)>
  baseline: 0
  target: <TBD on promotion>
  source: <TBD — derived from turn + clarity_moment tables>
guardrails:
  - name: Crisis-detection precision on red-team test suite
    threshold: ≥95% before every release
  - name: Conversation-turn P95 latency (mic-open → first TTS audio chunk)
    threshold: ≤3.5s end-to-end
  - name: Same-session escalation rate for crisis-flagged conversations
    threshold: ≥99%
measurement_window_days: 30
check_in_cadence: weekly
area_tags: [mobile, ai, voice, safety]
estimate:
  duration_weeks: 4
  confidence: low
  refined_by: stub
  refined_at: 2026-05-24
---

# AUR-2: Core voice reflection loop + crisis safety (single Conversation, English + Hindi)

> **STUB — portfolio-created 2026-05-24. Promote via `/create-brief AUR-2` to fill problem, scope, research, guardrails, and DRI before any design or build.**

> **Highest novelty-risk bet in the portfolio per Researcher Decision** ([portfolio.md](../../foundation/portfolio.md) § DRI) — four uncommon pieces converge here (Bhashini speech in conversational context, AI Gateway tuned for Indian-language reflection, persistent-memory hooks, vernacular crisis classifier).

## Hypothesis (the bet)

If a user can speak in their language and get back a reflective question via **Bhashini ASR + AI Gateway (Claude / OpenAI) + Bhashini TTS**, **with same-session crisis escalation** wired into every turn, then they complete a **Reflection Session** as defined by the product north-star (≥3 meaningful turns + explicit end OR saved clarity moment) — traces to [product § North-star metric (WAR definition)](../../foundation/product.md) + [product § Guardrails (Safety: ≥99% same-session escalation)](../../foundation/product.md) + [architecture § Stack → AI orchestration + Speech + Crisis detection](../../foundation/architecture.md).

## What this bet ships (intent — not full scope)

- Single-Conversation voice reflection loop (one persistent thread per user at this stage; multi-thread sidebar lands in AUR-4).
- ASR → LLM (system prompt versioned in `packages/ai/prompts/`) → TTS, end-to-end, in English + Hindi.
- Same-turn crisis classifier (keyword v1 seed from `packages/core/safety/keywords.ts`; LLM-based classifier ships post-MVP).
- Tele-MANAS escalation card on flag (14416 number; written in user's language).
- Pre-MVP per-language quality eval (R-PORTFOLIO-1 / R-SPEECH) — 20 reflection conversations per language scored MOS + WER. **If a language fails the in-house bar, ship without that language.**
- Audit-log writes for every CrisisFlag + EscalationEvent (immutable per data model).

## Problem
_To be filled on `/create-brief AUR-2` promotion._

## User
_To be filled on promotion._

## Why this matters
_To be filled on promotion. (Hint: this IS the value loop; without it Aura is just an onboarding funnel.)_

## Defensibility
**Moat impact (one line):** This bet doesn't directly build the data moat (AUR-3 does that), but it produces the turns + crisis-classifier signal that feed the moat. The system prompt + crisis taxonomy refined here also contribute to brand trust.

## Scope
_In/out of scope filled on promotion. Note: multi-conversation sidebar is explicitly OUT — that's AUR-4. Memory recall is explicitly OUT — that's AUR-3. Ratings capture is explicitly OUT — post-MVP._

## Open questions for Researcher
_Filled on promotion. Likely topics: Bhashini per-call latency profile under load; system-prompt eval methodology in vernacular; crisis classifier red-team test corpus._

## Research findings
_Filled on promotion._

## User pain input (from Support)
_N/A pre-launch._

## Stories
_Decomposed one at a time via `/create-story`. Likely decomposition: pre-MVP per-language quality eval → ASR + TTS pipeline → conversation loop + system prompt → crisis classifier + escalation card → red-team test suite._

## Check-in log
_Populated automatically by `/measure` cron after bet enters in-build._

## DRI Log

### Decisions
- [2026-05-24] [PM] Created as portfolio stub with crisis safety folded in (per [portfolio.md § DRI Decision #1](../../foundation/portfolio.md)). Full Decisions seeded on promotion.

### Risks
- [2026-05-24] [Researcher] Inherits R-PORTFOLIO-1 (Bhashini conversational-quality assumption unvalidated) — see [portfolio.md § DRI Risks](../../foundation/portfolio.md). First story under this bet must be the pre-MVP quality eval.

### Issues

- [2026-05-24] [Scanner] **Stub-state Product-phase findings raised by [SCAN-AUR-2](../scan-report.md) (2026-05-24).** Composite Issue tracking 6 open findings (2 Critical / 3 High / 1 Medium) — all share root cause `portfolio_stub: true`; not yet promoted via `/create-brief`.
  - **Severity (required, mandatory):** Critical (highest finding severity — PROD-01 + PROD-04, both non-suppressible).
  - **Owner (required, mandatory):** PM.
  - **Status:** open.
  - **Area (required, tag):** product / scanner.
  - **Resolution path:** Run `/create-brief AUR-2` to promote stub to full brief; HITL approve. Re-run `/scan AUR-2` to confirm findings closed (expect 0 after approval).
  - **Findings:** See [`scan-report.md`](../scan-report.md) for full list (PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-07).

---

_Approved by: <name> on <date>_
