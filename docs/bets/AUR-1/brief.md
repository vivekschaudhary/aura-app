---
id: AUR-1
type: feature
status: approved
priority: P0
parent: FOUNDATION-PRODUCT
portfolio_stub: false
depends_on: []
parallel_with: []
architecture_required: false
created: 2026-05-24
promoted: 2026-05-24
approved: 2026-05-24
approved_by: Vivek
author: PM
sources:
  - docs/foundation/portfolio.md
  - docs/foundation/product.md
  - docs/foundation/architecture.md
key_metric:
  name: Onboarding completion rate — % of first-opens that complete onboarding (no time cap) AND reach AUR-2's first voice turn within the same session
  baseline: 0 (pre-launch)
  target: ≥40%
  source: funnel events via Vercel Observability + Sentry breadcrumbs (instrumented under this bet)
guardrails:
  - name: Time to onboarding completion (P95, median user, ideal path)
    threshold: ≤60s
  - name: OTP fallback path usage among new users (rolling 30-day)
    threshold: ≤20% (above triggers R-AUTH-V2 escalation per architecture)
  - name: Handle uniqueness collision rate (users who need to retry handle ≥1×)
    threshold: ≤5%
  - name: Zero P0 trust incidents during onboarding flow
    threshold: 0
measurement_window_days: 30
check_in_cadence: weekly
area_tags: [mobile, auth, onboarding]
estimate:
  duration_weeks: 3
  confidence: high
  refined_by: stories
  refined_at: 2026-05-24
---

# AUR-1: Onboarding — passkey enrollment + handle + language picker (en, hi)

> **Promoted from portfolio stub 2026-05-24** via `/create-brief AUR-1`. See [portfolio.md § MVP bets](../../foundation/portfolio.md) for role in the wedge.

## Problem

The 536M underserved Indians the product bet targets have never created a digital identity for a service shaped like Aura. The onboarding patterns that work for English-fluent Western consumer apps (email + password, social sign-on, lengthy profile setup) are wrong shapes for this user — many have no email, distrust password forms, share phones with family, and are first-generation users of "create an account" flows. Adjacent Indian mass-market apps (Astrotalk, Pratilipi, ShareChat) optimize for SMS-OTP-and-go, but OTP-primary introduces per-MAU SMS cost compounding against our Cost fitness function (₹20/WAR/mo) and DLT approval friction. Failing to land an onboarding shape that fits this user — vernacular, friction-less, secure — means none of the downstream MVP bets (AUR-2 voice loop, AUR-3 memory moat, AUR-4 multi-conversation) ever sees a real user.

## User

**Primary cohort (first release):** ~50 hand-picked TestFlight / Internal Track users matched to the three product-bet personas (first-decision graduate, mid-life pivot, informal-sector worker). Hindi-primary or English-primary. Smartphone-fluent. **Most have never enrolled a passkey before** — onboarding is also their first exposure to biometric-credential UX.

Not yet in scope at this bet (revisit in subsequent bets): public-store anonymous installs, users with no biometric capability AND no SMS-reachable phone (edge case per R-AUTH-V2).

## Why this matters

AUR-1 is the **gate for every other bet in the MVP portfolio.** If onboarding doesn't land, AUR-2 has no one to talk to and AUR-3/AUR-4 have no one to remember. Strategic risks if this bet underperforms:
- **Brand-moat exposure:** the product's trust-as-product positioning begins (or breaks) at first-open. A botched onboarding kills the trust thesis before any conversation happens.
- **Memory-moat exposure:** users who don't complete onboarding never invest a single memory; AUR-3's switching-cost moat needs accumulated story to compound.
- **Cost-fitness exposure:** every failed onboarding that consumed an OTP costs ~₹0.15 of MSG91 spend without producing a WAR. Onboarding failure compounds the architectural cost ceiling pressure (R-COST in architecture).

## Hypothesis (the bet)

> If users can create an identity (handle + passkey, with SMS-OTP fallback on incapable devices) and pick their language (English or Hindi) in ≤3 steps and ≤60 seconds for the median user, then **≥40% of first-opens reach AUR-2's first voice turn** within the same session — traces to [product § Target users / personas](../../foundation/product.md), [product § Scope → In scope](../../foundation/product.md), [architecture § Stack → Auth / identity](../../foundation/architecture.md), [architecture decision: v1 launch languages en + hi](../../foundation/architecture.md).

**Falsifiable failure modes:**
- Completion rate < 40% sustained over the first 4 weeks of TestFlight → onboarding shape is wrong; redesign required before scale-out.
- Time-to-complete P95 > 60s with motivated TestFlight users → friction will be worse for anonymous public-store users; redesign required.
- OTP fallback usage > 20% → device-capability assumption is wrong; revisit R-AUTH-V2 mitigation.

## Defensibility (moat impact)

Onboarding itself is not a moat. **It is the precondition that lets every downstream moat compound.** Specifically: AUR-3's switching-cost moat (memory) requires investment to begin; AUR-4's brand-trust moat requires trust to be earned at first-open; the data-moat (vernacular corpus) requires WAR to exist. None of those start without AUR-1 landing cleanly.

**Moat impact (one line):** Enables the moats; doesn't build one.

## Scope

### In scope
- Language picker as the first interactive screen (English, Hindi only).
- Handle entry (3–32 chars, lowercase alphanumeric + underscore per `@aura/core` schema; uniqueness check; auto-suggest 3 variations if taken).
- Passkey enrollment ceremony (`@simplewebauthn/server` + `react-native-passkey`); biometric-gated.
- Capability detection: if device cannot create a passkey, route to OTP fallback automatically (no user-visible error path).
- SMS OTP fallback via MSG91: phone entry → OTP → verify (only for the ~5–15% fallback cohort per R-AUTH-V2).
- Returning-user flow: passkey assertion + biometric → straight to home surface (AUR-2's home, even though AUR-2 doesn't ship in this bet — home is a stub).
- `audit_log` entries on every enrollment, fallback, and recovery action per data model.
- Funnel instrumentation: one event per onboarding step (`language_picked`, `handle_entered`, `handle_accepted`, `identity_enrolled`, `reached_home`), keyed by `handle_hash` not handle.
- Bilingual UX copy for every user-facing string (UX Writer engages at `/create-story`).
- "Use this device next time" toggle for cloud-keychain sync (defaults OFF per R-AUTH-V2 mitigation).

### Out of scope (for AUR-1; revisit later)
- Welcome / value-prop screens. **Confirmed skip** (Vivek 2026-05-24). The conversation itself is the value; reading about it is friction.
- Password authentication, Google / Apple social sign-on, email collection — passkey + OTP only.
- Profile photo / avatar / display name beyond the handle.
- Anonymous "try the demo" mode — incompatible with the memory moat.
- Onboarding for the 5 ramp languages (Tamil, Telugu, Bengali, Marathi, Kannada) — gated by per-language quality eval per R-SPEECH.
- Identity recovery for the "lost device + no cloud sync + no OTP-capable phone" edge case — accepted as a staffed manual support path per R-AUTH-V2.
- Public app-store submission — per portfolio Deliberately-out-of-MVP.

## Open questions for Researcher

1. Empirical India passkey-enrollment time-to-complete for first-time enrollers in mass-market consumer apps — public data is thin; we'll instrument and measure in-cohort.
2. Handle naming UX in Hindi-primary users — Devanagari script support, Romanised only, or both? Architecture's `handleSchema` currently only allows `[a-z0-9_]` (Romanised). Worth UX-research validation before launch.
3. Shared-family-device cohort: do we offer "use the existing Aura account on this device" alongside "create my own"? R-AUTH-V2 raised this; not resolved.
4. MSG91 OTP template wording in Hindi — Indian banking patterns are pre-approved templates; reuse one of those as the starting point for the DLT approval submission.

## Research findings (so far — extended in `research.md` only if substantial)

- **Mobile onboarding completion benchmarks (2025–2026):**
  - Global 30-day onboarding completion: **8.4%** ([Business of Apps 2026](https://www.businessofapps.com/data/app-onboarding-rates/)).
  - Top quartile (finance, health, sports apps): **~26% day-1 completion** (same source).
  - Best practice: first meaningful action in **<60 seconds**, **3–7 steps total** ([VWO 2026 mobile onboarding guide](https://vwo.com/blog/mobile-app-onboarding-guide/)).
  - Day-1 uninstall rate baseline: **20–25%** ([Digia Engage](https://www.digia.tech/post/app-onboarding-rates-statistics)).
- **India / vernacular context:**
  - **90%** of new Indian internet users prefer vernacular; Hindi/Tamil apps see **30% higher engagement** ([ScaleUpAlly 2025](https://scaleupally.io/blog/future-of-app-development-in-india/)).
- **Passkey readiness (from architecture-research.md §1E):** Android **~97%** passkey-ready in 2026; iOS **~99%**.
- **Auto-triggering biometric enrollment lifts adoption 30–50%** ([Security Boulevard UX patterns 2026](https://securityboulevard.com/2026/04/10-ux-patterns-that-drive-80-passkey-adoption-with-real-examples/)).

**Justification for ≥40% target:** above the 26% top-quartile day-1 benchmark, justified by (a) hand-picked motivated TestFlight cohort > anonymous public installs, (b) vernacular-first focus where comparable apps see +30% engagement, (c) shortest-possible flow (3 steps, no value-prop). If we can't beat top-quartile with a motivated cohort and tightest flow, the design is wrong, not the target.

## User pain input (from Support)
_N/A pre-launch. Populated post-first-cohort if any support tickets land._

## Stories
_Decomposed one at a time via `/create-story AUR-1` after this brief is approved. Expected decomposition (subject to Designer + UX Writer engagement):_

1. Language picker screen (Hindi + English, vernacular-first defaults)
2. Handle entry + uniqueness check + auto-suggest
3. Passkey enrollment ceremony (capability detection + biometric prompt + cloud-keychain enrollment prompt)
4. OTP fallback path (MSG91 send + verify)
5. Returning-user assertion flow + home redirect stub
6. Funnel instrumentation + `audit_log` writes

## Check-in log
_Populated automatically by `/measure` cron after bet enters in-build._

## DRI Log

### Decisions

- [2026-05-24] [PM] **Primary metric is completion rate (no time cap), not time-bounded completion.** Time-to-complete becomes a guardrail (P95 ≤60s) rather than the primary.
  - **Rationale (required):** Per user direction 2026-05-24. Pure completion is easier to measure cleanly; the friction-less promise is captured in the guardrail. If completion is high but time is bad, that's still a problem (caught by guardrail); if completion is low, the metric flags it directly.
  - **Area (required, tag):** product / measurement.
  - **Alternatives considered (required):** "% reaching first voice turn in ≤60s" (rejected — composite metric makes diagnosis harder); "D1 retention of completed users" (rejected — measures cohort quality, not onboarding itself).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **Skip the value-prop / welcome screen entirely.** Language picker is the first interactive screen.
  - **Rationale (required):** Per user direction 2026-05-24. The conversation itself is the value; reading about it is friction. Consistent with the anti-engagement stance from R-PORTFOLIO-3 (Aura doesn't market in-product).
  - **Area (required, tag):** product / UX.
  - **Alternatives considered (required):** Two-screen value-prop tour (rejected — adds ~10s + drop-off); one-line splash (deferred — could add post-MVP if data shows new-user confusion).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **First cohort is TestFlight / Internal Track only (~50 hand-picked users).** Public app-store submission stays post-MVP per portfolio.
  - **Rationale (required):** Per user direction 2026-05-24. Lowest blast radius for first-version bugs; gives real-user signal without support burden. Aligned with portfolio "Deliberately out of MVP" deferral on public store submission.
  - **Area (required, tag):** product / launch sequencing.
  - **Alternatives considered (required):** TestFlight + 500 external waitlist (rejected — wider signal but more polish + support burden than needed for first release); public store Day 1 (rejected — contradicts portfolio).
  - **Reversibility:** easy.

- [2026-05-24] [PM] **Target ≥40% onboarding completion** — above the top-quartile day-1 benchmark of 26%.
  - **Rationale (required):** Motivated TestFlight cohort + vernacular-first focus (+30% engagement uplift in comparable apps) + shortest-possible flow (3 steps, no value-prop) should beat anonymous-cohort top-quartile by a meaningful margin. If we can't, the design is wrong, not the target.
  - **Area (required, tag):** product / measurement / targets.
  - **Alternatives considered (required):** 26% (top-quartile benchmark — rejected as too soft for a motivated cohort); 60% (rejected — no public benchmark to justify, would be vibes-target).
  - **Reversibility:** easy — adjust on first-cohort data.

- [2026-05-24] [PM] **`architecture_required: false`.** This bet leverages already-decided foundation architecture (passkey + handle + language enum + WebAuthn server lib + MSG91 fallback all baked into approved architecture v1).
  - **Rationale (required):** No new cross-system architectural decisions are introduced by AUR-1. Per-bet architecture would just restate foundation architecture.
  - **Area (required, tag):** process.
  - **Alternatives considered (required):** Set `auto` (rejected — would trigger an unnecessary `/create-bet-architecture AUR-1` step that produces a no-op doc).
  - **Reversibility:** easy — flip to true if a story under this bet reveals a cross-system question.

### Risks

- [2026-05-24] [PM] **R-AUR1-1: TestFlight ~50 hand-picked users are not a representative sample of the actual personas** (especially the "informal-sector worker" persona per product R1). AUR-1 metrics could look great with the engaged TestFlight cohort but onboarding may fall apart for true mass-market users post-MVP.
  - **Likelihood (required):** high (selection bias is structural).
  - **Impact (required):** medium (delays the moment of truth; doesn't block this bet, but inflates confidence in onboarding quality).
  - **Mitigation (required):** Q3 OKR persona-validation field work (product R1) should overlap with AUR-1 TestFlight rollout — schedule the 10-20 qualitative interviews on TestFlight users specifically. Use findings to validate (or invalidate) whether onboarding works for the informal-sector persona before any public-store work.
  - **Area (required, tag):** product / measurement / representativeness.

- [2026-05-24] [PM] **R-AUR1-2: Inherits R-AUTH-V2** from architecture (passkey fallback cohort ~5–15% on SMS OTP; potential lockout for edge case of no biometric + no cloud sync + lost device). AUR-1 is where this risk first becomes user-facing.
  - **Likelihood (required):** medium.
  - **Impact (required):** medium (per-user UX degradation, bounded to fallback cohort).
  - **Mitigation (required):** Per architecture R-AUTH-V2: (a) gentle prompt to enable cloud-keychain sync at signup (auto-triggering biometric enrollment lifts adoption 30-50%); (b) instrument fallback-path-usage as a monthly metric (≤20% guardrail above); (c) staffed manual recovery flow for the no-cloud-sync + lost-device + no-OTP-phone edge case.
  - **Area (required, tag):** security / UX.

- [2026-05-24] [Researcher] **R-AUR1-3: India passkey-enrollment time empirical benchmark for first-time enrollers in mass-market consumer apps is thin in public data.** Our ≤60s P95 guardrail is derived from generic mobile-onboarding benchmarks (VWO 2026) and architecture-research §3F passkey readiness, not from comparable Indian-consumer passkey deployments.
  - **Likelihood (required):** medium (any unknown benchmark could be off).
  - **Impact (required):** medium (could trigger false alarm on guardrail; or could miss real friction).
  - **Mitigation (required):** Treat the first 2 weeks of TestFlight as a benchmark-calibration period — adjust the ≤60s P95 guardrail based on first-cohort data if a clear better empirical target emerges. Re-baseline guardrails at the first weekly check-in (per check-in cadence).
  - **Area (required, tag):** research / measurement.

### Issues

- [2026-05-24] [PM] **MSG91 OTP template not yet DLT-approved** — depends on OPS-001 execution (2–5 business day async wait).
  - **Severity (required, mandatory):** P1 (blocks the OTP fallback path going live, which blocks the fallback cohort of new users).
  - **Owner (required, mandatory):** Enterprise/Solution Architect (via OPS-001 execution).
  - **Status:** open.
  - **Area (required, tag):** ops / dependency.

- [2026-05-24] [Researcher] **Handle UX in Devanagari script vs Romanised Hindi unresolved.** Current `handleSchema` allows only `[a-z0-9_]` (Romanised). Hindi-primary users may want native-script handles; UX research needed before any production cohort.
  - **Severity (required, mandatory):** P2 (TestFlight cohort can tolerate Romanised-only as first cut; resolve before any public expansion).
  - **Owner (required, mandatory):** PM + Researcher (with UX Writer at `/create-story`).
  - **Status:** open.
  - **Area (required, tag):** product / UX / i18n.

- [2026-05-24] [Scanner] **Build-entry forward-looking findings raised by [SCAN-AUR-1](./scan-report.md) (2026-05-24, second scan).** Composite Issue tracking 5 open findings (1 Critical / 4 High) — all share root cause "story is `ready` but `/build AUR-5` hasn't run yet; no code, no tests, no PRs, no reviews to evaluate." All raised at Low confidence; will auto-close as code lands during build.
  - **Severity (required, mandatory):** Critical (BUILD-05 — Security review absent; non-suppressible per catalog).
  - **Owner (required, mandatory):** Engineer (Build-phase owner).
  - **Status:** open.
  - **Area (required, tag):** build / scanner.
  - **Resolution path:** Run `/build AUR-5`. First PR opens → Codex Security Reviewer auto-engages (closes BUILD-05); test files land (closes BUILD-01/02/03); Architect compliance check fires on PR (closes BUILD-06). Re-run `/scan AUR-1` after first PR merges to confirm closure.
  - **Findings:** See [`scan-report.md`](./scan-report.md) for full list (BUILD-01, BUILD-02, BUILD-03, BUILD-05, BUILD-06).
  - **Note:** These are NOT actual gaps in shipped work — they're forward-looking checks firing pre-build. Do not suppress; resolve by proceeding with `/build`.

---

_Approved by: Vivek on 2026-05-24._
