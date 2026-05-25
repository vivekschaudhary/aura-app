---
id: AUR-4
type: feature
status: proposed
priority: P1
parent: FOUNDATION-PRODUCT
portfolio_stub: true
depends_on: [AUR-1, AUR-2]
parallel_with: [AUR-3]
architecture_required: auto
created: 2026-05-24
author: PM
sources:
  - docs/foundation/portfolio.md
key_metric:
  name: <to be defined on /create-brief promotion — likely: median active conversations per WAR after 30 days>
  baseline: 0
  target: ≥2 (the "users return to specific topics, not one growing thread" hypothesis)
  source: <TBD — analytics over conversation table grouped by user_id>
guardrails:
  - name: Sidebar load P95 latency
    threshold: ≤500ms (cold open of mobile app to sidebar visible with conversation list)
  - name: Auto-title accuracy (qualitative — % of user-edited titles after auto-generation)
    threshold: <30% user-edit rate (above means auto-title quality is poor)
measurement_window_days: 30
check_in_cadence: weekly
area_tags: [mobile, frontend, ux]
estimate:
  duration_weeks: 2
  confidence: low
  refined_by: stub
  refined_at: 2026-05-24
---

# AUR-4: Multi-conversation sidebar (parallel topical threads)

> **STUB — portfolio-created 2026-05-24. Promote via `/create-brief AUR-4` to fill problem, scope, research, guardrails, and DRI before any design or build.**

## Hypothesis (the bet)

If users can have **multiple parallel reflection threads** (Conversations) visible in a sidebar — each with an auto-generated title and last-active timestamp — then they **return to specific topics** rather than thread-hopping in one ever-growing conversation, validating the median-active-conversations-per-WAR target — traces to [architecture § Foundational Data Model § Conversation (persistent topical threads with title + last_active_at)](../../foundation/architecture.md) (per user direction 2026-05-24 after the Claude-sidebar screenshot prompted the architecture refinement) + [portfolio § DRI Decision #2 (multi-conversation in MVP, not post-MVP)](../../foundation/portfolio.md).

## What this bet ships (intent — not full scope)

- Mobile sidebar UI: list of user's Conversations sorted by `last_active_at`, with auto-generated `title` and a "new conversation" action.
- Auto-title generation: after ~3 turns, an LLM call summarises the conversation into a 2-5 word title; user-editable in place.
- Conversation switching: tapping a sidebar item loads that Conversation's turn history into the main reflection surface.
- Memory recall (from AUR-3) remains user-scoped, not Conversation-scoped — Aura still knows the whole story across all threads (the moat is unified).
- Soft-delete + restore (per data model § Delete posture): user can delete a Conversation; 30-day restore window.

## Problem
_To be filled on `/create-brief AUR-4` promotion._

## User
_To be filled on promotion._

## Why this matters
_To be filled on promotion. (Hint: without this, real users with parallel concerns either thread-hop in one growing convo (bad UX, dilutes memory recall quality) or abandon. We learned this from Vivek's Claude-sidebar screenshot during architecture refinement.)_

## Defensibility
**Moat impact (one line):** Reinforces the switching-cost moat from AUR-3 — more distinct conversations = more touchpoints, each anchored by memory, each harder to replicate elsewhere.

## Scope
_In/out of scope filled on promotion. Note: search across conversations is explicitly OUT (post-MVP); user-applied tags / folders are explicitly OUT (architecture decision: structured taxonomy is post-MVP — let titles emerge from content first)._

## Open questions for Researcher
_Filled on promotion. Likely topics: auto-title generation cost-per-call (matters for cost fitness function); UX research on Indian-language sidebar truncation patterns; concurrent-conversation limits (do we cap at N to manage memory recall scope?)._

## Research findings
_Filled on promotion._

## User pain input (from Support)
_N/A pre-launch._

## Stories
_Decomposed one at a time via `/create-story`. Likely decomposition: sidebar UI + Conversation list → auto-title generation → soft-delete + restore → conversation switching state management._

## Check-in log
_Populated automatically by `/measure` cron after bet enters in-build._

## DRI Log

### Decisions
- [2026-05-24] [PM] Created as portfolio stub. Multi-conversation included in MVP per [portfolio.md § DRI Decision #2](../../foundation/portfolio.md).

### Risks
- [2026-05-24] [PM] Auto-title generation is a per-conversation LLM call — cost impact on the ≤₹20/WAR/mo fitness function. To be sized in promotion.

### Issues

- [2026-05-24] [Scanner] **Stub-state Product-phase findings raised by [SCAN-AUR-4](../scan-report.md) (2026-05-24).** Composite Issue tracking 5 open findings (1 Critical / 3 High / 1 Medium) — all share root cause `portfolio_stub: true`.
  - **Severity (required, mandatory):** Critical (PROD-01, non-suppressible).
  - **Owner (required, mandatory):** PM.
  - **Status:** open.
  - **Area (required, tag):** product / scanner.
  - **Resolution path:** Run `/create-brief AUR-4` to promote, HITL approve. Re-run `/scan AUR-4` to confirm. Identical stub shape to AUR-3.
  - **Findings:** See [`scan-report.md`](../scan-report.md) (PROD-01, PROD-02, PROD-03, PROD-05, PROD-07).

---

_Approved by: <name> on <date>_
