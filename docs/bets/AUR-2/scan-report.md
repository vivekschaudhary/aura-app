---
id: SCAN-AUR-2
type: scan-report
status: living
bet_id: AUR-2
current_phase: Product
scanned_at: 2026-05-24
scanner_version: 1
open_findings:
  critical: 2
  high: 3
  medium: 1
  low: 0
suppressed_findings: 0
blocking_advance: true
---

# Scan Report — AUR-2 (Core voice reflection loop + crisis safety)

> Continuous quality scanner output. Findings, not failures. Re-render with `/scan AUR-2`. Never hand-edited — the next `/scan` run will overwrite. Owners triage; the scanner informs.

**Scanned:** 2026-05-24 · **Current phase:** Product (stub — `portfolio_stub: true`) · **Mode:** strict
**Triggered by:** `/scan --phase product` (manual)

## Summary

- **Open findings:** 6 total (2 critical · 3 high · 1 medium · 0 low)
- **Suppressed:** 0
- **Blocking phase advance:** **yes** — 2 non-suppressible Critical findings (PROD-01, PROD-04). Resolution path: promote via `/create-brief AUR-2`.
- **Top patterns this scan:** **Portfolio stub state** — all 6 findings share root cause (stub not yet promoted to full brief). One owner action resolves all six.

## Findings by phase

### Product

#### [CRITICAL] PROD-01 — Brief unapproved

- **Phase:** Product
- **Severity:** Critical
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (`status: proposed`, `portfolio_stub: true`)
- **Reason:** Brief frontmatter shows `status: proposed`; `portfolio_stub: true` indicates this is a stub awaiting `/create-brief` promotion. High confidence — frontmatter unambiguous.
- **Fix:** Run `/create-brief AUR-2` to promote stub to full brief, then HITL approve. Single owner action; root cause for all other findings in this scan.
- **Applies to bet types:** all
- **Suppressible:** **No** (foundational gate).

#### [CRITICAL] PROD-04 — Untestable hypothesis

- **Phase:** Product
- **Severity:** Critical
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (`key_metric.name`)
- **Reason:** `key_metric.name` reads `<to be defined on /create-brief promotion — likely: % of conversations producing ≥3 turns AND ending explicitly OR producing a clarity moment (the WAR-qualifying event)>`. Placeholder. No measurable target. High confidence — explicit `<to be defined>` marker.
- **Fix:** Define `key_metric` (name + baseline + target + source) when promoting via `/create-brief AUR-2`. The placeholder text suggests the likely shape; PM (Vivek) finalises on promotion.
- **Applies to bet types:** feature, okr, architectural-initiative
- **Suppressible:** **No** (foundational gate).

#### [HIGH] PROD-02 — Vague user definition

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (# User section)
- **Reason:** # User section reads `_To be filled on promotion._`. No persona detail. High confidence — explicit placeholder.
- **Fix:** Fill # User on `/create-brief AUR-2` promotion. Reference AUR-1 brief's # User section for the cohort-anchored shape.
- **Applies to bet types:** all
- **Suppressible:** Yes (DRI justification required).

#### [HIGH] PROD-03 — Scope undefined

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (# Scope section)
- **Reason:** # Scope reads `_In/out of scope filled on promotion. Note: multi-conversation sidebar is explicitly OUT — that's AUR-4. Memory recall is explicitly OUT — that's AUR-3. Ratings capture is explicitly OUT — post-MVP._` — has scope-direction hints (cross-bet boundaries called out) but the canonical "In scope" / "Out of scope" lists are placeholders. High confidence (explicit "filled on promotion").
- **Fix:** Fill # Scope on promotion. The stub's note already calls out 3 key out-of-scope cross-bet boundaries (AUR-4, AUR-3, ratings) — use as starting point.
- **Applies to bet types:** all
- **Suppressible:** Yes (DRI justification required).

#### [HIGH] PROD-07 — Approval not recorded

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (frontmatter + bottom line)
- **Reason:** No `approved` / `approved_by` fields in frontmatter; bottom line shows placeholder `_Approved by: <name> on <date>_`. High confidence.
- **Fix:** Approve at HITL after `/create-brief AUR-2` promotion fills the brief content.
- **Applies to bet types:** all
- **Suppressible:** **No** (foundational gate).

#### [MEDIUM] PROD-05 — Insufficient research evidence

- **Phase:** Product
- **Severity:** Medium
- **Confidence:** High
- **Location:** `docs/bets/AUR-2/brief.md` (# Research findings)
- **Reason:** # Research findings reads `_Filled on promotion._`. No cited sources. Threshold: ≥3. High confidence.
- **Fix:** Fill # Research findings on promotion. Researcher engages per `/create-brief` workflow — focus areas likely: Bhashini production-quality benchmarks for conversational Hindi (R-PORTFOLIO-1 carryover), AI Gateway latency under voice-loop workload, crisis-classifier red-team corpus availability.
- **Applies to bet types:** all
- **Suppressible:** Yes (owner accept).

### Architecture / Build / Production Ready / GTM / Operate

_Phase not yet active._

### Notes on PROD-06 (Defensibility) — NOT raised

- # Defensibility section is substantive: "This bet doesn't directly build the data moat (AUR-3 does that), but produces the turns + crisis-classifier signal that feed the moat. The system prompt + crisis taxonomy refined here also contribute to brand trust." Substantive content despite stub state. PASS at Medium check.

## Suppressed findings

_No suppressions._

## Owner actions

Choose one (and reflect the decision in the bet's DRI):

- [ ] **Resolve all 6 findings via single action: `/create-brief AUR-2`** (recommended — all findings share the stub root cause; promotion closes them in one pass) — once promoted, re-run `/scan AUR-2` to confirm; expect 0 findings after HITL approval lands.
- [ ] **Suppress PROD-01 + PROD-04** with HITL approval + DRI risk-acceptance (NOT recommended — explicitly listed as non-suppressible foundational gates; doing so would silently accept that AUR-2 has no measurable hypothesis).

## Scan history

| Date | Version | Open (C / H / M / L) | Suppressed | Blocking | Triggered by |
|------|---------|----------------------|------------|----------|--------------|
| 2026-05-24 | 1 | 2 / 3 / 1 / 0 | 0 | yes | `/scan --phase product` |
| 2026-05-24 | 1 | 2 / 3 / 1 / 0 | 0 | yes | `/scan --all` (re-scan; findings unchanged — no `/create-brief` promotion between runs) |

---

_Living artifact — re-run `/scan AUR-2` to refresh. Auto-invoked by `/advance` and at phase boundaries by `/build`._
