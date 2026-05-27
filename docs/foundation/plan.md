---
id: PROJECT-PLAN
type: plan
version: 2
status: living
created: 2026-05-24
last_refreshed: 2026-05-26
parent: FOUNDATION-PRODUCT
---

# Project Plan

> Living, time-bound schedule for the MVP bet wedge. Derived from per-bet artifacts; refreshed by `/plan` (auto-triggered by `/advance`). Never hand-edited — re-run `/plan` to refresh.

**Last refreshed:** 2026-05-26 (Tue) — version 2 — first refinement after AUR-5 PR #1 + PR #2 merged + e2e smoke green on iOS device
**Total MVP runway estimate:** ~6.5 weeks (2026-05-24 → ~2026-07-09) · revised down from 9 weeks at seed; AUR-1 running ~13 days ahead of seed estimate
**Source artifacts:** [`portfolio.md`](./portfolio.md) (approved) · [AUR-1 brief](../bets/AUR-1/brief.md) (approved, in-build) · [AUR-5 story](../bets/AUR-1/stories/AUR-5/story.md) (in-build; PR #1 + #2 merged; AC1/2/3/7/8 partial/11 validated empirically) · AUR-2/3/4 (stubs)

## Currently in flight

AUR-1 entered build on 2026-05-25 with PR #1 (frontend slice) merged. PR #2 (backend slice) merged same day. End-to-end smoke green on iOS device 2026-05-26 against live Vercel + Supabase. AC4 (passkey enrollment ceremony) and PR #3 (Codex E2E suite) outstanding.

| Bet | Title | Phase | Actual start | Estimated end | Owner |
|-----|-------|-------|--------------|---------------|-------|
| **AUR-1** | Onboarding — passkey + handle + language picker (en, hi) | Build | 2026-05-25 | 2026-05-27 | Engineer (Claude) + Reviewer (Codex) + Vivek |

## Next up (unblocked, not yet started)

| Bet | Title | Estimated start | Estimated duration | Confidence |
|-----|-------|-----------------|---------------------|------------|
| **AUR-2 brief promotion** | Voice reflection loop + crisis safety — `/create-brief` from stub | 2026-05-28 (Thu) | 2 days (Researcher + PM) | medium |
| **AUR-2 first story (Sarvam quality eval)** | Pre-MVP per-language voice eval | 2026-05-29 (Fri) | ~1 week (1 sprint) | medium |
| **AUR-2 full build** | ASR → LLM → TTS chain + crisis classifier | 2026-06-05 (Fri) | 3 weeks | low (depends on eval outcome) |

AUR-2's brief promotion is unblocked — depends only on AUR-1 build progress (not completion). Eval can start in parallel with AUR-1's last days. Full build gated on AUR-1 shipping + eval passing the quality bar.

## Blocked

| Bet | Title | Blocked by | Since | Mitigation |
|-----|-------|------------|-------|------------|
| **AUR-3** | Persistent memory layer (the moat) | (a) Stub state — `portfolio_stub: true`. (b) `depends_on: [AUR-1, AUR-2]`. | 2026-05-24 | Promote anytime via `/create-brief AUR-3`. Build gated on AUR-2 completion. |
| **AUR-4** | Multi-conversation sidebar | (a) Stub state. (b) `depends_on: [AUR-1, AUR-2]`. | 2026-05-24 | Promote anytime via `/create-brief AUR-4`. Build can run in parallel with AUR-3 once AUR-2 ships. |

**Plan-level cross-cutting blockers updated 2026-05-26:**

- ~~OPS-001 (account provisioning) blocks end-to-end dev environment.~~ **Partial-shipped 2026-05-26.** Supabase + Vercel + AI Gateway live; smoke test validated against production. Sentry / Sarvam / MSG91 deferred (each with explicit DRI Decision rationale — see `docs/ops/OPS-001.md`).
- **AC4 (passkey enrollment ceremony) blocks 4 ACs of AUR-5** (AC4 itself + AC5 home stub reach + AC8 credential row + AC10 full crash-free path). Needs `eas build --profile development` + AASA + Android Asset Links. ~2-3 hour focused session targeted for Day 1 of next 5-day plan (2026-05-27).

## Done

_No MVP bets shipped yet, but AUR-5 story (first under AUR-1) is on track to ship 2026-05-27 (Wed, Day 2 of the next-5-day plan) — ~18 days ahead of original seed estimate (2026-06-14)._

| Bet | Title | Actual end | Duration (actual vs estimated) |
|-----|-------|------------|-------------------------------|
| _(empty)_ | | | |

## Full schedule

| Bet | Title | Depends on | Est. start | Est. end | Actual start | Actual end | Duration (wk) | Confidence | Last refined by |
|-----|-------|------------|------------|----------|--------------|------------|--------------:|------------|-----------------|
| **AUR-1** | Onboarding — passkey + handle + language picker (en, hi) | — | 2026-05-24 | **2026-05-27** | 2026-05-25 | — | **0.5 actual** | **high** | smoke-green empirical observation 2026-05-26 (Tue); AUR-5 ships Wed 2026-05-27 (~18 days ahead of v1 seed) |
| **AUR-2** | Core voice reflection loop + crisis safety | AUR-1 | **2026-05-28** (Thu — brief promotion; eval start Fri) | **2026-06-25** | — | — | 4 | **medium** | promotion-imminent; Sarvam swap (architecture amendment 2026-05-26) reframes R-PORTFOLIO-1 — eval target is Sarvam, not Bhashini |
| **AUR-3** | Persistent memory layer (the moat) | AUR-1, AUR-2 | **2026-06-26** | **2026-07-09** | — | — | 2 | low | stub |
| **AUR-4** | Multi-conversation sidebar | AUR-1, AUR-2 | **2026-06-26** | **2026-07-09** | — | — | 2 | low | stub |

## Calendar view

Week numbers count from week-of-now (today Tue 2026-05-26). Each week is Monday → Sunday (sprint cadence = 1 week per `compass/config.yaml`). v2 refresh shows AUR-1 wrapping mid-week 1 (vs week 3 in v1 seed); cascading earlier-end across the whole portfolio.

```
Week of:              | Wk 1  | Wk 2  | Wk 3  | Wk 4  | Wk 5  | Wk 6  | Wk 7  |
                      | 05-25 | 06-01 | 06-08 | 06-15 | 06-22 | 06-29 | 07-06 |
----------------------|-------|-------|-------|-------|-------|-------|-------|
AUR-1 (onboarding)    |  ▌    |       |       |       |       |       |       |  ships Wed 05-27
AUR-2 brief + eval    |  ▌    |  ██   |       |       |       |       |       |  brief Thu 05-28; eval Fri 05-29 + Wk 2
AUR-2 (voice + safety)|       |       |  ██   |  ██   |       |       |       |
AUR-3 (memory moat)   |       |       |       |       |  ██   |  ██   |       |
AUR-4 (sidebar)       |       |       |       |       |  ██   |  ██   |       |
```

Legend: `██` full week of work, `▌` partial week (transition / overlap).

Parallel streams (per portfolio): Stream 1 = AUR-1 → AUR-2 sequential gates (now compressed). Stream 2 = AUR-3 ∥ AUR-4 after AUR-2 ships.

## Next 5 days (action plan, 2026-05-26 → 2026-06-01)

| Day | Date | Focus | Outputs |
|-----|------|-------|---------|
| 1 | **Tue 2026-05-26 (today)** | **AC4 dev-build sprint** | `eas build --profile development` for iOS + Android; AASA file deployed at `apps/web/public/.well-known/`; Android Asset Links; bundle 2 UX cleanups (back-affordance on Handle, passkey error-state mapping). Walk full flow; verify `passkey_credentials` row + `auth.passkey_enrolled` audit_log entry in Supabase. |
| 2 | Wed 2026-05-27 | **PR #3 — Codex-owned E2E suite** | Maestro or Detox E2E covering AC1–AC11 against the dev build. 1 Codex review pass + merge. AUR-5 flips to `merged`. Update `changelog.md` + `status.md`. |
| 3 | Thu 2026-05-28 | **`/create-brief AUR-2` + 3 runbooks** | AUR-2 brief approved; first story scoped (Sarvam quality eval). Three runbooks codifying the 14-item framework catalog (`pnpm-monorepo-rn`, `vercel-pnpm-monorepo`, `expo-go-vs-dev-build`). |
| 4 | Fri 2026-05-29 | **Sarvam provisioning + eval Day 1** | `/ops OPS-003` for Sarvam: KYC, API key, push to Vercel env. Wire `packages/ai/src/speech.ts` against Sarvam. Collect 10–20 reflection-style Hindi samples from self + 2 native-speaker reviewers (also addresses R-COPY-1 mitigation). First ASR + TTS pass; WER + MOS measurements. |
| 5 | Mon 2026-06-01 | **Q3 OKR foundations + plan/dashboard refresh** | Persona-validation interview protocol (Q3 OKR KR2; R1/R-PERSONA). Funding plan outline (Q3 OKR KR4; R6). Re-run `/plan` + `/dashboard` for stakeholder view. AUR-5 ships fully if Day 1 + Day 2 went green. |

## Refinement log

Each time a date moves, this table appends one row. The triggering artifact is named so output → input causality is auditable.

| Date | Bet | Field changed | From | To | Triggered by |
|------|-----|---------------|------|-----|--------------|
| 2026-05-24 | AUR-1 | duration_weeks | (none) | 3 | brief-approval + stories (docs/bets/AUR-1/brief.md, docs/bets/AUR-1/stories/AUR-5/story.md) — first refinement above stub default |
| 2026-05-24 | AUR-1 | confidence | (none) | high | stories (AUR-5 `ready`) |
| 2026-05-24 | AUR-1 | estimated_start | (none) | 2026-05-24 | seed (no deps; portfolio approved) |
| 2026-05-24 | AUR-1 | estimated_end | (none) | 2026-06-14 | seed (start + 3wk) |
| 2026-05-24 | AUR-2 | duration_weeks | (none) | 4 | stub default 2wk + 2wk allowance for R-PORTFOLIO-1 (Bhashini eval) per portfolio Researcher Decision |
| 2026-05-24 | AUR-2 | estimated_start | (none) | 2026-06-15 | seed (AUR-1 estimated_end + 1 day) |
| 2026-05-24 | AUR-2 | estimated_end | (none) | 2026-07-12 | seed (start + 4wk) |
| 2026-05-24 | AUR-3 | duration_weeks | (none) | 2 | stub default |
| 2026-05-24 | AUR-3 | estimated_start | (none) | 2026-07-13 | seed (AUR-2 estimated_end + 1 day) |
| 2026-05-24 | AUR-3 | estimated_end | (none) | 2026-07-26 | seed (start + 2wk) |
| 2026-05-24 | AUR-4 | duration_weeks | (none) | 2 | stub default |
| 2026-05-24 | AUR-4 | estimated_start | (none) | 2026-07-13 | seed (AUR-2 estimated_end + 1 day; parallel with AUR-3) |
| 2026-05-24 | AUR-4 | estimated_end | (none) | 2026-07-26 | seed (start + 2wk) |
| **2026-05-25** | **AUR-1** | **actual_start** | (none) | **2026-05-25** | First PR opened (PR #1 frontend slice, commit `da3db57`) |
| **2026-05-25** | **AUR-1** | _no date change_ | — | — | PR #1 + PR #2 (backend) merged same day (squash `ea6c8ef` + `7ce397c`); confidence remains high |
| **2026-05-26** | **AUR-1** | **estimated_end** | 2026-06-14 | **2026-05-27** | AUR-5 e2e smoke green Tue 2026-05-26; AUR-5 ships Wed 2026-05-27 after AC4 (Day 1, today) + PR #3 (Day 2). |
| **2026-05-26** | **AUR-1** | **duration_weeks** | 3 | **0.5** | actual: 3 days from first PR open (Mon 2026-05-25) to ship (Wed 2026-05-27) |
| **2026-05-26** | **AUR-2** | **estimated_start** | 2026-06-15 | **2026-05-28** | brief promotion (Thu Day 3) starts in parallel with AUR-1 final wrap; eval kicks off Fri Day 4 |
| **2026-05-26** | **AUR-2** | **estimated_end** | 2026-07-12 | **2026-06-25** | start moves 18 days earlier; duration unchanged (4wk) |
| **2026-05-26** | **AUR-2** | confidence | low | **medium** | architecture amendment 2026-05-26 (Sarvam swap) reduces R-PORTFOLIO-1's surface from "validate Bhashini quality" to "validate Sarvam quality with proven OSS DR fallback" |
| **2026-05-26** | **AUR-3** | **estimated_start** | 2026-07-13 | **2026-06-26** | AUR-2 estimated_end + 1 day (cascaded earlier) |
| **2026-05-26** | **AUR-3** | **estimated_end** | 2026-07-26 | **2026-07-09** | start moves 17 days earlier; duration unchanged (2wk) |
| **2026-05-26** | **AUR-4** | **estimated_start** | 2026-07-13 | **2026-06-26** | parallel with AUR-3 |
| **2026-05-26** | **AUR-4** | **estimated_end** | 2026-07-26 | **2026-07-09** | parallel with AUR-3 |
| **2026-05-26** | _all bets_ | _date correction_ | (v2 initial post-2026-05-26 14:00 IST) | _(corrected)_ | Off-by-one fix: I initially treated today (Tue 2026-05-26) as Mon 2026-05-25 and shifted all "next 5 days" dates +1. Corrected after user catch. Plan dates now have Day 1 = today; AUR-1 ships Day 2 (Wed 2026-05-27); AUR-2 brief promotion Day 3 (Thu 2026-05-28); MVP runway ~6.5 weeks ending ~2026-07-09. |

## Risks to plan

Things that could shift this schedule materially. Inherited from upstream artifacts; cited here so they're visible at plan level.

- **AC4 dev-build setup risk (next 5 days, Day 1):** Apple Developer enrollment delay, AASA validation issue, EAS build infra issue. Materializes as a 1–3 day slip on AUR-5 ship. Mitigation: AUR-5 could ship as "passkey-only, dev-build-only" without AC4 if dev-build setup hits a wall — the user-row write path is already validated; passkey enrollment becomes its own follow-up story.
- **R-SPEECH + R-SPEECH-2 (carryover from architecture, amended 2026-05-26):** Sarvam quality on Hindi not empirically validated. If eval (next 5 days, Day 4) shows Hindi WER/MOS below the bar, escalate to architecture v3 amendment per R-SPEECH-2 — could add 1–2 weeks to AUR-2 for re-evaluation against alternatives (Whisper for English with DPDPA tradeoff, self-host AI4Bharat OSS as primary with Op-ex tradeoff).
- **R-PORTFOLIO-2 (carryover):** Cumulative 4-bet runway. With AUR-1 acceleration banked, the buffer for AUR-2 expansion is larger; but if AUR-2 expands by 2+ weeks past the new 2026-06-26 end, AUR-3/AUR-4 starts compound. Mitigation: re-scope checkpoint at AUR-2's first story (eval outcome).
- **R6 from product v2 (funding):** Free-burn 0→100K WAR requires funding plan committed in writing (Q3 OKR KR4). Plan-level impact: if funding doesn't land within ~6 sprints (~Wk 6), the runway-to-100K-WAR thesis weakens and the entire schedule needs re-scoping. Day 5 of next 5-day plan starts the outline.
- **R-PORTFOLIO-3 (anti-engagement stance not in product v2 metrics):** Carries forward. Not a 5-day blocker but should be revisited when first cohort lands to decide if product v3 amendment is warranted.
- **Sarvam KYC / API issuance delay (next 5 days, Day 4):** If Sarvam onboarding takes >1 day, eval slides; mitigation: run eval against AI4Bharat OSS models (downloadable, same lineage) until Sarvam access lands.

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

- [2026-05-26] [Project Manager] **v2 refresh — AUR-1 duration revised from 3wk estimate to 1.5wk actual + AUR-2 start advanced to 2026-05-29 (parallel-stream with AUR-1 wrap).** Triggered by empirical observation: AUR-5 e2e smoke green on iOS device against live Vercel + Supabase 2026-05-26, with AC1/2/3/7/8(partial)/11 validated. Only AC4 (dev build + AASA) + PR #3 (E2E suite) remain — bounded to ~5 working days per the next-5-day action plan above.
  - **Rationale (required):** Plan estimates are coarse by design but they should refine when empirical signal lands. PRs landing in days (not weeks) and most ACs validating against a real backend in 2 days is strong signal that AUR-1 was estimated conservatively. AUR-2 brief promotion can start during AUR-1's wrap-up days because it's a Researcher + PM artifact, not blocked by Engineer's AUR-1 finish.
  - **Area (required, tag):** plan / refinement / empirical-update.
  - **Alternatives considered (required):** Keep 3wk estimate as buffer (rejected — buffer should be visible at the bet level, not hidden in plan estimates that drive other decisions); revise AUR-1 to 1wk (rejected — Day 1 AC4 dev-build setup is genuinely a 2-3 hour piece of work with real risk of slip per its own R logged above, so 1.5wk total is the honest number).
  - **Reversibility:** easy — re-run `/plan` after each new commit / PR / phase advance.

- [2026-05-26] [Project Manager] **The plan-document file was hand-edited to ship this v2 refresh, instead of invoking `/plan` workflow.** Plan-document header normally says "Never hand-edited — re-run /plan to refresh." This refresh is hand-written by the Project Manager role acting in band, while the user is mid-session, to capture the empirical update + the next 5-day action plan in one move.
  - **Rationale (required):** Pragmatic exception. The user explicitly asked "update the plan" while in a working session; invoking the full `/plan` workflow would re-trigger reading all bet artifacts and produce a similar output with overhead. The hand-edit preserves the v1 → v2 refinement log row format + DRI logging convention; the next automatic `/plan` invocation will overwrite this content with a fresh derivation. If the auto-output differs, that's auditable via this DRI entry.
  - **Area (required, tag):** plan / process / hand-edit-exception.
  - **Alternatives considered (required):** Invoke Skill('plan') workflow inline (rejected — heavier and would re-do the analysis I already did; less responsive to the user's in-session ask); decline the hand-edit and refuse (rejected — pedantic about a `living` artifact). Hand-edit with this DRI entry preserves auditability.
  - **Reversibility:** easy — `/plan` workflow will overwrite on next invocation; the DRI entry is permanent record of why a hand-edit happened.

### Risks

- [2026-05-24] [Project Manager] **R-PLAN-1: Seed-run estimates are coarse by design** (per workflow note: "Date estimation is coarse on purpose"). Treating these dates as commitments would be inappropriate.
  - **Likelihood (required):** high (any seed estimate has wide error bars).
  - **Impact (required):** low (plan is `living`; refinements come automatically).
  - **Mitigation (required):** Re-run `/plan` after every bet's next phase advance (or rely on `/advance` to auto-trigger). Watch `confidence` column — low-confidence estimates should not drive external commitments.
  - **Area (required, tag):** plan / process.
  - **Status update 2026-05-26:** v2 refresh confirms R-PLAN-1 — seed estimates were ~50% too generous for AUR-1. Caveat: AUR-2/3/4 confidence is still low (one bet's empirical signal doesn't transfer to others). The "AUR-1-was-easy" data point should NOT be used to flatten AUR-2's estimates further.

### Issues

_None at plan-creation stage. Schedule-blocking issues from upstream artifacts (architecture P1s, product R6) remain tracked in their own DRI logs and surfaced under § Risks to plan above._

---

_Living artifact — re-run `/plan` to refresh. Auto-triggered by `/advance`._
