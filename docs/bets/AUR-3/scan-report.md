---
id: SCAN-AUR-3
type: scan-report
status: living
bet_id: AUR-3
current_phase: Product
scanned_at: 2026-05-24
scanner_version: 1
open_findings:
  critical: 1
  high: 3
  medium: 1
  low: 0
suppressed_findings: 0
blocking_advance: true
---

# Scan Report — AUR-3 (Persistent memory layer — the moat)

> Continuous quality scanner output. Findings, not failures. Re-render with `/scan AUR-3`. Never hand-edited — the next `/scan` run will overwrite. Owners triage; the scanner informs.

**Scanned:** 2026-05-24 · **Current phase:** Product (stub — `portfolio_stub: true`) · **Mode:** strict
**Triggered by:** `/scan --phase product` (manual)

## Summary

- **Open findings:** 5 total (1 critical · 3 high · 1 medium · 0 low)
- **Suppressed:** 0
- **Blocking phase advance:** **yes** — 1 non-suppressible Critical finding (PROD-01). Resolution path: promote via `/create-brief AUR-3`.
- **Top patterns this scan:** **Portfolio stub state** — 5 findings share root cause (stub not yet promoted). One owner action resolves all five. AUR-3 has a *better* stub than AUR-2 because PROD-04 (metric defined) and PROD-06 (defensibility substantive) both pass.

## Findings by phase

### Product

#### [CRITICAL] PROD-01 — Brief unapproved

- **Phase:** Product
- **Severity:** Critical
- **Confidence:** High
- **Location:** `docs/bets/AUR-3/brief.md` (`status: proposed`, `portfolio_stub: true`)
- **Reason:** Brief frontmatter shows `status: proposed`; stub awaiting promotion. High confidence.
- **Fix:** Run `/create-brief AUR-3` to promote, then HITL approve.
- **Applies to bet types:** all
- **Suppressible:** **No** (foundational gate).

#### [HIGH] PROD-02 — Vague user definition

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-3/brief.md` (# User section)
- **Reason:** # User section reads `_To be filled on promotion._`. High confidence.
- **Fix:** Fill on promotion. Note: AUR-3 is a server-side memory layer bet, so "user" framing is slightly different from AUR-1's UI-bet shape — focus on the user's relationship to memory (privacy expectation, transparency, deletion control) rather than UI persona detail.
- **Applies to bet types:** all
- **Suppressible:** Yes (DRI justification required).

#### [HIGH] PROD-03 — Scope undefined

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-3/brief.md` (# Scope section)
- **Reason:** # Scope reads `_In/out of scope filled on promotion. Note: envelope encryption (Variant C) is explicitly OUT — deferred to future architectural-initiative bet. Cross-conversation memory shared across all of a user's threads is IN — that's the whole point._` Has 2 key scope-direction hints (envelope-encryption OUT, cross-conversation memory IN) but canonical lists are placeholder. High confidence.
- **Fix:** Fill on promotion. Use the stub's 2 hints as starting point.
- **Applies to bet types:** all
- **Suppressible:** Yes (DRI justification required).

#### [HIGH] PROD-07 — Approval not recorded

- **Phase:** Product
- **Severity:** High
- **Confidence:** High
- **Location:** `docs/bets/AUR-3/brief.md` (frontmatter + bottom line)
- **Reason:** No `approved` / `approved_by` fields; bottom line is placeholder. High confidence.
- **Fix:** Approve at HITL after promotion.
- **Applies to bet types:** all
- **Suppressible:** **No** (foundational gate).

#### [MEDIUM] PROD-05 — Insufficient research evidence

- **Phase:** Product
- **Severity:** Medium
- **Confidence:** High
- **Location:** `docs/bets/AUR-3/brief.md` (# Research findings)
- **Reason:** # Research findings reads `_Filled on promotion._`. No cited sources. High confidence.
- **Fix:** Fill on promotion. Researcher focus areas: pgvector recall benchmarks at >10M vectors (architecture R-MEMORY pressure), embedding model cost/quality trade-offs (OpenAI text-embedding-3-small vs alternatives), memory-transparency UX precedents from ChatGPT Memory / Replika.
- **Applies to bet types:** all
- **Suppressible:** Yes (owner accept).

### Notes on PROD-04 and PROD-06 — NOT raised

- **PROD-04 PASSES:** `key_metric.name = "D30 retention (proxy for memory-driven switching cost)"`, `baseline: 0`, `target: ≥25%`, `source: <TBD — analytics over user + conversation tables>`. Metric is fully testable. Source has TBD prefix but the source TYPE (analytics over named tables) is identified — PASS with Medium confidence (TBD reduces confidence one level but doesn't make the metric untestable).
- **PROD-06 PASSES:** # Defensibility is substantive: "This bet IS the primary switching-cost moat from product v2. Memory + cumulative story = the user's irreplaceable investment. Also begins compounding the data-moat..." Substantial content despite stub state.

### Architecture / Build / Production Ready / GTM / Operate

_Phase not yet active._

## Suppressed findings

_No suppressions._

## Owner actions

- [ ] **Resolve all 5 findings via single action: `/create-brief AUR-3`** (recommended — all findings share stub root cause). Re-run `/scan AUR-3` after HITL approval; expect 0 findings.
- [ ] Suppress PROD-01 with HITL (NOT recommended — non-suppressible).

## Scan history

| Date | Version | Open (C / H / M / L) | Suppressed | Blocking | Triggered by |
|------|---------|----------------------|------------|----------|--------------|
| 2026-05-24 | 1 | 1 / 3 / 1 / 0 | 0 | yes | `/scan --phase product` |
| 2026-05-24 | 1 | 1 / 3 / 1 / 0 | 0 | yes | `/scan --all` (re-scan; findings unchanged) |

---

_Living artifact — re-run `/scan AUR-3` to refresh._
