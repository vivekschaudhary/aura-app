---
id: AUR-3
type: feature
status: proposed
priority: P0
parent: FOUNDATION-PRODUCT
portfolio_stub: true
depends_on: [AUR-1, AUR-2]
parallel_with: [AUR-4]
architecture_required: auto
created: 2026-05-24
author: PM
sources:
  - docs/foundation/portfolio.md
key_metric:
  name: <to be defined on /create-brief promotion — likely: D30 retention (proxy for memory-driven switching cost)>
  baseline: 0
  target: ≥25% (lower bound of AI-companion benchmark; mirrors product Objective 1 KR2)
  source: <TBD — analytics over user + conversation tables>
guardrails:
  - name: Memory recall P95 latency
    threshold: ≤1.5s
  - name: pgvector HNSW index size vs instance RAM
    threshold: ≤60% (alert when exceeded — R-MEMORY from architecture)
measurement_window_days: 30
check_in_cadence: weekly
area_tags: [backend, data, ai, memory]
estimate:
  duration_weeks: 2
  confidence: low
  refined_by: stub
  refined_at: 2026-05-24
---

# AUR-3: Persistent memory layer (the moat)

> **STUB — portfolio-created 2026-05-24. Promote via `/create-brief AUR-3` to fill problem, scope, research, guardrails, and DRI before any design or build.**

## Hypothesis (the bet)

If Aura **remembers the user's story across sessions** via Postgres + pgvector semantic recall integrated into the turn loop, then **D30 retention reaches ≥25%** (lower bound of AI-companion category benchmark; user returns because Aura knows them) — traces to [product § Defensibility / Moat (primary moat #1: "the friend who knows your story")](../../foundation/product.md) + [product OKR Objective 1 KR2](../../foundation/product.md) + [architecture § Stack → Memory layer + Foundational Data Model § Memory entity](../../foundation/architecture.md).

## What this bet ships (intent — not full scope)

- Embedding pipeline: on assistant-turn end, extract memory-worthy fragments → write to `memories` table with embedding (per data model).
- Recall pipeline: on user-turn start, run ANN query against the user's memory store, retrieve top-K relevant memories, inject into system-prompt context for the LLM.
- Memory write/recall integrated into AUR-2's turn loop (without breaking the P95 turn-latency fitness function of ≤3.5s).
- Index health monitoring (memory recall P95, HNSW index size vs RAM) per R-MEMORY.
- User-facing memory transparency (lightweight): on demand, user can see what Aura remembers; can delete a memory (soft-delete with 30-day restore per data model).

## Problem
_To be filled on `/create-brief AUR-3` promotion._

## User
_To be filled on promotion._

## Why this matters
_To be filled on promotion. (Hint: without memory, Aura is ChatGPT in Hindi — no differentiation, no switching cost moat, the whole product bet collapses.)_

## Defensibility
**Moat impact (one line):** This bet IS the primary switching-cost moat from product v2. Memory + cumulative story = the user's irreplaceable investment. Also begins compounding the data-moat (vernacular decision corpus, even if aggregate analysis ships later).

## Scope
_In/out of scope filled on promotion. Note: envelope encryption (Variant C) is explicitly OUT — deferred to future architectural-initiative bet. Cross-conversation memory shared across all of a user's threads is IN — that's the whole point._

## Open questions for Researcher
_Filled on promotion. Likely topics: embedding-model choice + cost per memory; memory-extraction heuristics (what's worth remembering); user-perception research on "creepy vs caring" memory transparency UX._

## Research findings
_Filled on promotion._

## User pain input (from Support)
_N/A pre-launch._

## Stories
_Decomposed one at a time via `/create-story`. Likely decomposition: embedding pipeline → recall pipeline → in-turn integration → index health monitoring → memory transparency UI._

## Check-in log
_Populated automatically by `/measure` cron after bet enters in-build._

## DRI Log

### Decisions
- [2026-05-24] [PM] Created as portfolio stub. Full Decisions seeded on promotion.

### Risks
- [2026-05-24] [PM] Inherits R-MEMORY from architecture (pgvector HNSW index eviction → P95 latency tank). Mitigations defined in architecture must be implemented under this bet.

### Issues

- [2026-05-24] [Scanner] **Stub-state Product-phase findings raised by [SCAN-AUR-3](../scan-report.md) (2026-05-24).** Composite Issue tracking 5 open findings (1 Critical / 3 High / 1 Medium) — all share root cause `portfolio_stub: true`.
  - **Severity (required, mandatory):** Critical (PROD-01, non-suppressible).
  - **Owner (required, mandatory):** PM.
  - **Status:** open.
  - **Area (required, tag):** product / scanner.
  - **Resolution path:** Run `/create-brief AUR-3` to promote, HITL approve. Re-run `/scan AUR-3` to confirm. AUR-3 has a better stub than AUR-2 (PROD-04 + PROD-06 already PASS).
  - **Findings:** See [`scan-report.md`](../scan-report.md) (PROD-01, PROD-02, PROD-03, PROD-05, PROD-07).

---

_Approved by: <name> on <date>_
