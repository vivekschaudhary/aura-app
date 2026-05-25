---
id: PROJECT-PLAN
type: plan
version: 1
status: living
created: 2026-05-24
last_refreshed: 2026-05-24
parent: FOUNDATION-PRODUCT
---

# Project Plan

> Living, time-bound schedule for the MVP bet wedge. Derived from per-bet artifacts; refreshed by `/plan` (auto-triggered by `/advance`). Never hand-edited — re-run `/plan` to refresh.

**Last refreshed:** 2026-05-24 (version 1, seed run)
**Total MVP runway estimate:** 9 weeks (2026-05-24 → 2026-07-26) · well inside the 12-month north-star window
**Source artifacts:** [`portfolio.md`](./portfolio.md) (approved) · AUR-1 brief (approved, 1 story `ready`) · AUR-2/3/4 (stubs)

## Currently in flight

_No bets have a build PR merged yet. AUR-1's first story (AUR-5) is `ready` but `/build AUR-5` hasn't run; `actual_start` populated only on first PR open (per estimate model). Once that lands, AUR-1 moves here._

| Bet | Title | Phase | Actual start | Estimated end | Owner |
|-----|-------|-------|--------------|---------------|-------|
| _(empty)_ | | | | | |

## Next up (unblocked, not yet started)

| Bet | Title | Estimated start | Estimated duration | Confidence |
|-----|-------|-----------------|---------------------|------------|
| **AUR-1** | Onboarding — passkey + handle + language picker (en, hi) | 2026-05-24 (today) | 3 weeks | high |

AUR-1 is unblocked: no upstream dependencies, brief approved, AUR-5 story `ready`, scaffold complete. Next action: `/build AUR-5`.

## Blocked

| Bet | Title | Blocked by | Since | Mitigation |
|-----|-------|------------|-------|------------|
| **AUR-2** | Core voice reflection loop + crisis safety | (a) Stub state — `portfolio_stub: true`; needs `/create-brief AUR-2`. (b) `depends_on: [AUR-1]`. | 2026-05-24 | Run `/create-brief AUR-2` any time (independent of AUR-1 build progress) to advance Product phase. Build still gated on AUR-1 completion. |
| **AUR-3** | Persistent memory layer (the moat) | (a) Stub state. (b) `depends_on: [AUR-1, AUR-2]`. | 2026-05-24 | Promote anytime via `/create-brief AUR-3`. Build gated on AUR-2 completion. |
| **AUR-4** | Multi-conversation sidebar | (a) Stub state. (b) `depends_on: [AUR-1, AUR-2]`. | 2026-05-24 | Promote anytime via `/create-brief AUR-4`. Build can run in parallel with AUR-3 once AUR-2 ships. |

**Cross-cutting blocker:** OPS-001 (account provisioning) is `approved` but Phase 3 execution pending. Doesn't block AUR-1 code-writing, but blocks first end-to-end dev environment + Story 2 (OTP fallback) under AUR-1 + TestFlight cohort invites.

## Done

_None yet — bootstrap phase complete, but no shipped MVP bets._

| Bet | Title | Actual end | Duration (actual vs estimated) |
|-----|-------|------------|-------------------------------|
| _(empty)_ | | | |

## Full schedule

| Bet | Title | Depends on | Est. start | Est. end | Actual start | Actual end | Duration (wk) | Confidence | Last refined by |
|-----|-------|------------|------------|----------|--------------|------------|--------------:|------------|-----------------|
| **AUR-1** | Onboarding — passkey + handle + language picker (en, hi) | — | 2026-05-24 | 2026-06-14 | — | — | 3 | **high** | stories (AUR-5 `ready`) |
| **AUR-2** | Core voice reflection loop + crisis safety | AUR-1 | 2026-06-15 | 2026-07-12 | — | — | 4 | **low** | stub (+1wk for R-PORTFOLIO-1) |
| **AUR-3** | Persistent memory layer (the moat) | AUR-1, AUR-2 | 2026-07-13 | 2026-07-26 | — | — | 2 | **low** | stub |
| **AUR-4** | Multi-conversation sidebar | AUR-1, AUR-2 | 2026-07-13 | 2026-07-26 | — | — | 2 | **low** | stub |

## Calendar view

Week numbers count from week-of-today (2026-05-24). Each week is Monday → Sunday (sprint cadence = 1 week per `compass/config.yaml`).

```
Week of:              | Wk 1  | Wk 2  | Wk 3  | Wk 4  | Wk 5  | Wk 6  | Wk 7  | Wk 8  | Wk 9  |
                      | 05-25 | 06-01 | 06-08 | 06-15 | 06-22 | 06-29 | 07-06 | 07-13 | 07-20 |
----------------------|-------|-------|-------|-------|-------|-------|-------|-------|-------|
AUR-1 (onboarding)    |  ██   |  ██   |  ██   |       |       |       |       |       |       |
AUR-2 (voice + safety)|       |       |       |  ██   |  ██   |  ██   |  ██   |       |       |
AUR-3 (memory moat)   |       |       |       |       |       |       |       |  ██   |  ██   |
AUR-4 (sidebar)       |       |       |       |       |       |       |       |  ██   |  ██   |
```

Two parallel-stream candidates (per portfolio): Stream 1 = AUR-1 → AUR-2 sequential gates. Stream 2 = AUR-3 ∥ AUR-4 after AUR-2 ships.

## Refinement log

Each time a date moves, this table appends one row. The triggering artifact is named so output → input causality is auditable.

| Date | Bet | Field changed | From | To | Triggered by |
|------|-----|---------------|------|-----|--------------|
| 2026-05-24 | AUR-1 | duration_weeks | (none) | 3 | brief-approval + stories (docs/bets/AUR-1/brief.md, docs/bets/AUR-1/stories/AUR-5/story.md) — first refinement above stub default |
| 2026-05-24 | AUR-1 | confidence | (none) | high | stories (AUR-5 `ready`) |
| 2026-05-24 | AUR-1 | estimated_start | (none) | 2026-05-24 | seed (no deps; portfolio approved) |
| 2026-05-24 | AUR-1 | estimated_end | (none) | 2026-06-14 | seed (start + 3wk) |
| 2026-05-24 | AUR-2 | duration_weeks | (none) | 4 | stub default 2wk + 2wk allowance for R-PORTFOLIO-1 (Bhashini eval) per portfolio Researcher Decision (docs/foundation/portfolio.md § DRI) |
| 2026-05-24 | AUR-2 | estimated_start | (none) | 2026-06-15 | seed (AUR-1 estimated_end + 1 day) |
| 2026-05-24 | AUR-2 | estimated_end | (none) | 2026-07-12 | seed (start + 4wk) |
| 2026-05-24 | AUR-3 | duration_weeks | (none) | 2 | stub default |
| 2026-05-24 | AUR-3 | estimated_start | (none) | 2026-07-13 | seed (AUR-2 estimated_end + 1 day) |
| 2026-05-24 | AUR-3 | estimated_end | (none) | 2026-07-26 | seed (start + 2wk) |
| 2026-05-24 | AUR-4 | duration_weeks | (none) | 2 | stub default |
| 2026-05-24 | AUR-4 | estimated_start | (none) | 2026-07-13 | seed (AUR-2 estimated_end + 1 day; parallel with AUR-3) |
| 2026-05-24 | AUR-4 | estimated_end | (none) | 2026-07-26 | seed (start + 2wk) |

## Risks to plan

Things that could shift this schedule materially. Inherited from upstream artifacts; cited here so they're visible at plan level.

- **R-PORTFOLIO-1 (carryover from portfolio.md):** Bhashini conversational quality unvalidated for English + Hindi. If AUR-2's first task (per-language quality eval) shows Hindi MOS below the bar, AUR-2 expands by 1–3 weeks for fallback (Sarvam) or re-architecture. Mitigation: treat the eval as Sprint 1 of AUR-2; gate the rest of AUR-2 design on its outcome.
- **R-PORTFOLIO-2 (carryover):** Cumulative 4-bet runway. AUR-2 sliding by 2+ weeks compounds into AUR-3/AUR-4 starts. Mitigation: each `/create-brief` is a checkpoint to re-scope; option to split safety out of AUR-2 if it expands past 6 weeks.
- **OPS-001 execution pending:** Until accounts provisioned, no end-to-end dev environment exists. AUR-1 code can be written, but the first PR can't actually run against Supabase + AI Gateway. Mitigation: start OPS-001 now (MSG91 DLT has 2–5 day async lead time); run in parallel with AUR-5 build.
- **R6 from product v2 (funding):** Free-burn 0→100K WAR requires funding plan committed in writing (Q3 OKR KR4). Plan-level impact: if funding doesn't land within ~6 sprints (~Wk 6), the runway-to-100K-WAR thesis weakens and the entire schedule needs re-scoping.
- **R-PORTFOLIO-3 (anti-engagement stance not in product v2 metrics):** Not a schedule risk directly, but if AUR-2's `/create-brief` promotion has to incorporate closure-friendly metrics that aren't yet in product v2, that adds Researcher work to AUR-2's Product phase (~3–5 days).

## DRI Log

### Decisions

- [2026-05-24] [Project Manager] **Seed run estimates use the model's progression for each bet's current phase:** AUR-1 at "stories" refinement (high confidence, 3wk); AUR-2/3/4 at "stub" refinement (low confidence, default durations).
  - **Rationale (required):** Per workflow estimate model. AUR-1 has 1 story `ready` so it qualifies for the "stories" refinement; AUR-2/3/4 remain `portfolio_stub: true` so they sit at "stub" default. Bumping confidence for stubs would be unwarranted optimism.
  - **Area (required, tag):** plan / estimates.
  - **Alternatives considered (required):** Use uniform 2-week defaults for all 4 bets (rejected — discards the signal that AUR-1 is meaningfully ahead); use story-count math for AUR-1's 6 expected stories × 3 days = ~4wk (rejected — only 1 story is created, not 6, so the count is speculative).
  - **Reversibility:** easy — refines automatically on next `/plan` after each bet's next phase advance.

- [2026-05-24] [Project Manager] **AUR-2 gets +2 weeks above the stub default** (4wk instead of 2wk) to absorb R-PORTFOLIO-1 (Bhashini conversational quality eval) without immediately blowing the schedule on first refinement.
  - **Rationale (required):** Portfolio Researcher Decision (2026-05-24) explicitly flagged AUR-2 as highest-novelty-risk. Building in slack here is more honest than baselining at 2wk and adding refinements after the fact. R-PORTFOLIO-2 (cumulative runway risk) cited the same concern.
  - **Area (required, tag):** plan / estimates / risk.
  - **Alternatives considered (required):** Keep stub default 2wk (rejected — predictable mid-schedule slip); use 6wk (rejected — too pessimistic without empirical eval data).
  - **Reversibility:** easy — refines after AUR-2 brief promotion.

### Risks

- [2026-05-24] [Project Manager] **R-PLAN-1: Seed-run estimates are coarse by design** (per workflow note: "Date estimation is coarse on purpose"). Treating these dates as commitments would be inappropriate.
  - **Likelihood (required):** high (any seed estimate has wide error bars).
  - **Impact (required):** low (plan is `living`; refinements come automatically).
  - **Mitigation (required):** Re-run `/plan` after every bet's next phase advance (or rely on `/advance` to auto-trigger). Watch `confidence` column — low-confidence estimates should not drive external commitments.
  - **Area (required, tag):** plan / process.

### Issues

_None at plan-creation stage. Schedule-blocking issues from upstream artifacts (architecture P1s, product R6) remain tracked in their own DRI logs and surfaced under § Risks to plan above._

---

_Living artifact — re-run `/plan` to refresh. Auto-triggered by `/advance`._
