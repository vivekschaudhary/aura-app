---
id: SCAN-AUR-1
type: scan-report
status: living
bet_id: AUR-1
current_phase: Build
scanned_at: 2026-05-24
scanner_version: 1
open_findings:
  critical: 1
  high: 4
  medium: 0
  low: 0
suppressed_findings: 0
blocking_advance: true
---

# Scan Report — AUR-1 (Onboarding — passkey + handle + language picker)

> Continuous quality scanner output. Findings, not failures. Re-render with `/scan AUR-1`. Never hand-edited — the next `/scan` run will overwrite. Owners triage; the scanner informs.

**Scanned:** 2026-05-24 (second scan today) · **Current phase:** Build (entering — AUR-5 story `ready`; no PRs / CI yet) · **Mode:** strict
**Triggered by:** `/scan --all` (manual)

## Summary

- **Open findings:** 5 total (1 critical · 4 high · 0 medium · 0 low)
- **Suppressed:** 0
- **Blocking phase advance:** **yes** (strict mode + Build-phase Critical present) — but note the "advance" here would be Build → Production Ready, which is not being attempted yet. AUR-1 is at *Build entry*, not Build exit.
- **Top patterns this scan:** **Build-entry forward-looking findings.** All 5 Build-phase findings have the same root cause: story is `ready` but `/build AUR-5` hasn't run yet — no code, no tests, no PRs, no reviews exist to evaluate. They will resolve naturally as `/build` runs.

## Findings by phase

### Product

_No open findings in this phase._ (Confirmed clean across both 2026-05-24 scan runs — see Scan history table.)

### Architecture

_No open findings in this phase._

| Check | Result | Notes |
|-------|--------|-------|
| ARCH-01 Architecture decision undocumented | PASS | AUR-1 brief `architecture_required: false` + explicit DRI Decision (PM, 2026-05-24): "This bet leverages already-decided foundation architecture (passkey + handle + language enum + WebAuthn server lib + MSG91 fallback all baked into approved architecture v1). No new cross-system architectural decisions are introduced by AUR-1. Per-bet architecture would just restate foundation architecture." Per ARCH-01 rule "no arch doc AND no DRI decline" → DRI decline present → PASS. High confidence. |
| ARCH-02..06 | N/A | No bet-level architecture doc exists by design (declined). Checks evaluate a non-existent artifact; vacuously pass. |
| ARCH-07 Rollout plan missing | PASS | AUR-1 brief # User section + DRI R-S1-1 document the staged-rollout intent: TestFlight ~50 hand-picked users for first release; public store post-MVP; AUR-5 ships to internal-dev cohort only until Story 2 (OTP fallback) lands. Staged rollout is implied but documented. High confidence. |

### Build

5 forward-looking findings. All at Low confidence — the *gap* exists today (no code/tests/PRs/reviews yet) but it's *expected* at Build-entry state; resolves as `/build AUR-5` runs. Owner action is the same for all: proceed with `/build AUR-5`.

#### [CRITICAL] BUILD-05 — Security review absent on auth-touching bet

- **Phase:** Build
- **Severity:** Critical
- **Confidence:** **Low** (gap is real today, but Security Reviewer engagement is sequenced for the first PR — not yet "skipped")
- **Location:** `docs/bets/AUR-1/stories/AUR-5/story.md` (touches passkey enrollment, handle, user PII) — GitHub MCP shows zero PRs against the AUR-5 branch
- **Reason:** Story touches `auth` + `PII` (passkey credential + handle stored in `users` + `passkey_credentials` per data model). Per `compass/config.yaml` `tool_assignments.security_reviewer: codex`, Security Reviewer auto-engages on any PR for an auth/PII-touching bet. **No PRs exist yet** → no Codex review can be cited. Low confidence: the security review is *pending*, not *skipped*. Will resolve when `/build AUR-5` opens its first PR and Codex review fires per `/build` workflow.
- **Fix:** Run `/build AUR-5`. The first PR opens; Codex Security Reviewer engages automatically. This finding auto-closes on next `/scan AUR-1` once review is recorded.
- **Applies to bet types:** any bet touching auth/PII/payments/secrets/external input/sessions
- **Suppressible:** **No** (non-suppressible per catalog).
- **Owner action:** Proceed with `/build AUR-5`. Do not suppress.

#### [HIGH] BUILD-01 — AC test coverage incomplete

- **Phase:** Build
- **Severity:** High
- **Confidence:** **Low** (Build-entry; story is `ready`, build not started)
- **Location:** `docs/bets/AUR-1/stories/AUR-5/story.md` (12 acceptance criteria) ↔ filesystem (`apps/mobile/**`, `apps/web/**`, `packages/**`, `e2e/**`) — no test files exist
- **Reason:** 12 ACs declared in AUR-5; zero mapped to test files because no test files exist yet. Test plan is described in story.md § Tests (Engineer-written units + Codex E2E) but unrealised. Low confidence: gap real but pre-build; will close as code + tests land during `/build AUR-5`.
- **Fix:** Write unit / integration / component tests during `/build AUR-5` per the story's § Tests plan. Each AC should have ≥1 test reference. Per scanner anti-pattern: do NOT suppress this; it's a real check that will close naturally.
- **Applies to bet types:** feature, architectural-initiative
- **Suppressible:** Yes (DRI per AC) — but unnecessary; will auto-close during build.

#### [HIGH] BUILD-02 — Test layer coverage incomplete

- **Phase:** Build
- **Severity:** High
- **Confidence:** **Low** (Build-entry)
- **Location:** filesystem — no Vitest / Playwright / Detox test files exist anywhere yet
- **Reason:** Per Compass role allocation, Engineer writes unit/API/component tests; no test files exist at any layer pre-build. Same Build-entry signal as BUILD-01. Low confidence.
- **Fix:** Land tests during `/build AUR-5` (Vitest for unit/integration per architecture § Cross-cutting standards § Testing; component tests for the 3 onboarding screens; tRPC procedure tests).
- **Suppressible:** Yes (DRI) — unnecessary at Build-entry.

#### [HIGH] BUILD-03 — E2E coverage gap

- **Phase:** Build
- **Severity:** High
- **Confidence:** **Low** (Build-entry)
- **Location:** `e2e/` directory — doesn't exist yet
- **Reason:** Per role allocation `reviewer: codex` writes E2E; no E2E files exist for any AC user flow. Story.md plans Detox or Maestro coverage for happy path. Low confidence — pre-build.
- **Fix:** Codex writes E2E during `/build AUR-5` review phase, covering AC1–AC11 happy path (AC12 device-rendering check is manual). Auto-closes on next scan.
- **Suppressible:** Yes (DRI) — unnecessary.

#### [HIGH] BUILD-06 — Architect compliance check absent on PRs

- **Phase:** Build
- **Severity:** High
- **Confidence:** **Low** (vacuously raised — no PRs to check)
- **Location:** GitHub MCP — no PRs against AUR-5 branch
- **Reason:** Per Compass: "Architect compliance enforced on every PR." Zero PRs → no compliance check can be cited. Vacuous failure. Low confidence — will auto-resolve when first PR opens and Architect compliance check runs per `/build` workflow.
- **Fix:** Proceed with `/build AUR-5`. First PR triggers Architect compliance review automatically.
- **Suppressible:** Yes (DRI) — unnecessary.

### Notes on BUILD-04 and BUILD-07 — NOT raised

- **BUILD-04 PASS:** "Open review BLOCKERs on PRs" — zero PRs exist, so zero BLOCKERs. Vacuously PASS.
- **BUILD-07 N/A:** "Performance budget exceeded (budget defined in arch doc, exceeded in CI)" — no per-bet architecture doc exists; no performance budget defined at AUR-1 level. Foundation architecture has the global performance fitness functions (turn P95 ≤3.5s, memory recall P95 ≤1.5s) but those apply to AUR-2/AUR-3, not AUR-1 onboarding. Not applicable to AUR-1.

### Production Ready / GTM / Operate

_Phase not yet active._

## Suppressed findings

_No suppressions._

## Owner actions

- [ ] **Recommended — proceed with `/build AUR-5`.** All 5 Build-phase findings are forward-looking; they will auto-close as code + tests + reviews land during build. Re-run `/scan AUR-1` after the first PR merges to confirm closure.
- [ ] Suppress BUILD-01/02/03/06 with DRI (NOT recommended — these are accurate gaps; the right resolution is to fix them during build, not suppress).
- [ ] Suppress BUILD-05 with HITL approval (**strongly not recommended** — non-suppressible per catalog; the gap is the *absence* of an automatic safeguard; suppressing it removes the safeguard).

## Scan history

| Date | Version | Open (C / H / M / L) | Suppressed | Blocking | Triggered by |
|------|---------|----------------------|------------|----------|--------------|
| 2026-05-24 | 1 | 0 / 0 / 0 / 0 | 0 | no | `/scan --phase product` |
| 2026-05-24 | 1 | 1 / 4 / 0 / 0 | 0 | yes | `/scan --all` (second scan today; added Architecture + Build coverage) |
| 2026-05-24 | 1 | 1 / 4 / 0 / 0 | 0 | yes | `/scan AUR-1` (third scan today; findings identical to prior run — no code/artifact changes since; ran to refresh dashboard via auto-trigger) |

---

_Living artifact — re-run `/scan AUR-1` to refresh. Auto-invoked by `/advance` and at phase boundaries by `/build`._
