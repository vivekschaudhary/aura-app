---
id: AUR-2
type: feature
status: approved
priority: P0
parent: FOUNDATION-PRODUCT
portfolio_stub: false
depends_on: [AUR-1]
parallel_with: []
architecture_required: true
created: 2026-05-24
promoted: 2026-05-27
approved: 2026-05-28
approved_by: Vivek
author: PM
sources:
  - docs/foundation/portfolio.md
  - docs/foundation/product.md
  - docs/foundation/architecture.md
  - docs/bets/AUR-1/brief.md
key_metric:
  name: Reflection Session completion rate — % of voice conversations producing ≥3 meaningful turns AND ending in an explicit closure (user-initiated end) OR a saved clarity moment, within the first 14 days of user availability
  baseline: 0 (pre-launch)
  target: ≥40% of attempted-voice-conversations qualify as Reflection Sessions
  source: instrumented in `turn` table + `clarity_moment` table; computed via SQL roll-up per architecture § Foundational Data Model
guardrails:
  - name: Crisis-detection precision on red-team test suite
    threshold: ≥95% before every release (per product § Guardrails)
  - name: Crisis-flagged conversations getting same-session escalation
    threshold: ≥99% (per product § Guardrails — non-negotiable)
  - name: Conversation-turn P95 latency (mic-open → first TTS audio chunk)
    threshold: ≤3.5s end-to-end (per architecture § Performance fitness)
  - name: ASR word error rate (WER) for Hindi in conversational/code-switched audio
    threshold: ≤25% on the in-house eval corpus (R-SPEECH gating threshold; below this we ship without Hindi)
  - name: All-in cost per WAR per month (including speech I/O introduced by this bet)
    threshold: ≤₹20 (per architecture § Cost fitness; new in-scope: Sarvam per-minute charges)
measurement_window_days: 30
check_in_cadence: weekly
area_tags: [mobile, ai, voice, safety, crisis-detection]
estimate:
  duration_weeks: 4
  confidence: medium
  refined_by: brief-approval
  refined_at: 2026-05-27
---

# AUR-2: Core voice reflection loop + crisis safety (single Conversation, English + Hindi)

> Promoted from portfolio stub via `/create-brief AUR-2` (2026-05-27). Inherits hypothesis trace from [portfolio.md](../../foundation/portfolio.md); fills problem, user, scope, research, and DRI not present at stub.

> **Highest novelty-risk bet in the portfolio** per Researcher Decision ([portfolio.md § DRI](../../foundation/portfolio.md)) — four uncommon pieces converge here: Sarvam AI speech in conversational context _(post-2026-05-26 amendment, was Bhashini)_, AI Gateway tuned for Indian-language reflection, persistent-memory hooks (consumed by AUR-3), and a vernacular crisis classifier.

## Problem

Onboarding lands users on a static home stub. Without a working voice reflection loop, **Aura produces no value yet** — the WAR (Weekly Active Reflector) metric is structurally unreachable because Reflection Sessions don't exist as a thing to count. The primary moat (persistent memory of the user's story, AUR-3) also doesn't accumulate because there are no turns to remember. The brand promise ("a vernacular voice-first AI counsel") is undelivered until a user can press the mic, speak in Hindi, and hear a reflective question back.

There's a second-order problem the voice loop must solve simultaneously: **users in emotional distress will use Aura**. The architecture's Safety fitness function requires ≥99% of crisis-flagged conversations get same-session escalation to Tele-MANAS (helpline `14416`). A voice loop without crisis detection is not shippable — it would risk a P0 trust incident before the first 100 users.

## User

**Primary cohort (first release):** the same ~50 hand-picked TestFlight users from AUR-1, now able to use the product for what it's actually for. Specifically:

- **First-decision graduates** (persona 1): early-career users facing ambiguous life choices (career pivot, relationship, family pressure) without trusted adult counsel
- **Mid-life pivots** (persona 2): users 30-45 navigating second-career, divorce, parenting decisions
- **Informal-sector workers** (persona 3): a less-validated cohort per product R1 — included in the eval but the lowest-confidence segment

**User context at this point in the funnel:** they've completed onboarding (AUR-1), they understand they're talking to AI (not a human counselor), they speak Hindi natively (most of them) and may code-switch to English when they don't know a word for an emotional concept. They're alone with their phone — the use case is private reflection, not public-facing.

**Not yet in scope at this bet:** users with active crisis presentation (handled by escalation, not engagement); users who need professional psychotherapy (Aura is not a substitute — that's a brand-trust line we don't cross); users without microphone-capable devices (no real cohort at our launch quality bar — Expo SDK 52 mic permission handles capability detection).

## Why this matters

AUR-2 is **the load-bearing bet of the entire MVP portfolio**. Strategic reasoning:

1. **WAR exists only if AUR-2 ships.** The north-star metric is "Weekly Active Reflectors" — Reflection Sessions are the unit. Without voice loop, no sessions, no WAR. AUR-1 (onboarding) and AUR-3 (memory) and AUR-4 (sidebar) are scaffolding around AUR-2; if AUR-2 doesn't land, the others are infrastructure with no purpose.
2. **The memory moat (AUR-3) is enabled by AUR-2's outputs.** Turns are what get embedded into pgvector and recalled. AUR-3's switching-cost moat begins compounding the moment AUR-2 starts producing turns.
3. **The brand-trust moat (architecture § Defensibility moat #3) is empirically validated here.** Users either trust the reflective-questioning experience or they don't. We learn at AUR-2.
4. **R-SPEECH risk gets retired or compounded here.** Today the architecture assumes Sarvam AI can deliver acceptable Hindi conversational quality. AUR-2's first story (the empirical eval) either confirms or invalidates that assumption; if invalidated, R-SPEECH-2 mitigation (self-host AI4Bharat OSS) gets exercised early enough to absorb the schedule hit.
5. **The cost ceiling (≤₹20/WAR/mo) is first stress-tested here.** Speech I/O is the first real per-minute cost line item (Supabase + Vercel + AI Gateway are mostly fixed; Sarvam scales with usage). If the cost model is wrong, we learn it at AUR-2's first month of usage data.

## Hypothesis (the bet)

> If a user can speak in their language and get back a reflective question via **Sarvam AI ASR + AI Gateway (Claude / OpenAI) + Sarvam AI TTS**, **with same-session crisis escalation** wired into every turn, then **≥40% of first-month users who attempt at least one voice conversation will complete a Reflection Session** (≥3 meaningful turns + explicit closure OR saved clarity moment) within 14 days of availability.
>
> Traces to [product § North-star metric (WAR definition)](../../foundation/product.md), [product § Guardrails (Safety: ≥99% same-session escalation; Crisis-classifier precision ≥95%)](../../foundation/product.md), [architecture § Stack → AI orchestration + Speech + Crisis detection](../../foundation/architecture.md), [architecture amendment 2026-05-26 — Sarvam swap (SUPERSEDES Bhashini-primary decision)](../../foundation/architecture.md).

**Falsifiable failure modes:**

- Reflection Session completion <30% in the first 4 weeks of TestFlight → reflective-questioning conversation shape is wrong for the audience, or speech quality is too poor to sustain a conversation. Either way: redesign before scale-out.
- ASR Hindi WER >25% on the in-house eval corpus → speech provider quality bar fails; escalate per R-SPEECH-2 to AI4Bharat OSS self-host OR architecture v3 amendment.
- Crisis classifier precision <95% on red-team suite → cannot ship; story slips.
- Same-session escalation rate <99% → P0 trust incident waiting to happen; cannot ship.

## Defensibility (moat impact)

This bet **enables** moats but doesn't directly build them.

- **Switching-cost moat (primary; AUR-3 owns it):** AUR-2 produces the turns that feed memory. Without turn data, AUR-3 has nothing to embed. AUR-2 is the upstream input to the moat-building bet.
- **Brand-trust moat (architecture moat #3):** The reflective-questioning system prompt + crisis safety experience IS what users will judge Aura on. A patient, non-judgmental voice that catches a crisis well is the brand artifact. A chatty, advice-giving voice that misses a crisis is the brand-destroying artifact.
- **Data moat (vernacular corpus, secondary):** The turn corpus collected here is proprietary — over time it becomes a Hindi conversational-counsel dataset no other product has. But this only compounds at scale (>10K WAR).

**Moat impact (one line):** Doesn't build the memory or data moats directly, but is the load-bearing prerequisite for both, and IS the brand-trust moat's primary surface area.

## Scope

### In scope

- **Single-Conversation voice reflection loop** — one persistent conversation thread per user. User can press mic, speak, get a reflective text response, hear it as TTS audio, and continue the conversation. Multi-thread sidebar is AUR-4, OUT of scope here.
- **Sarvam AI ASR + TTS integration** (Hindi + Indian-English) per architecture amendment 2026-05-26. Self-hosted AI4Bharat OSS as DR fallback runbook (R-SPEECH-2 mitigation — drafted before TestFlight invites).
- **AI Gateway orchestration** of Claude (Sonnet primary) + OpenAI (GPT-4o-mini secondary, for cost-aware non-critical turns) per architecture § AI orchestration. Per-turn model selection logic.
- **Reflective-counsel system prompt** versioned in `packages/ai/prompts/system.ts` (already stubbed there per Phase B scaffold). Hindi + English versions. Patient, non-advice-giving register — UX Writer + Researcher engage on tone.
- **Per-turn crisis classifier (v1 = keyword-based)** seeded from `packages/core/safety/keywords.ts` (already populated per scaffold). LLM-based classifier ships post-MVP; not blocking AUR-2.
- **Tele-MANAS escalation card** rendered on crisis flag — number `14416`, copy in user's language (UX Writer engages for copy review per copy.md pattern).
- **Audit log writes** for every `CrisisFlag` + `EscalationEvent` (immutable per architecture data model).
- **Pre-MVP per-language quality eval** as the FIRST story under this bet (per R-PORTFOLIO-1 / R-SPEECH gating). 50-100 reflection-style voice samples per language scored on WER (ASR) + MOS (TTS) + code-switching handling + end-to-end latency. **If Hindi fails the bar, ship without Hindi** (per R-SPEECH mitigation).
- **One Reflection Session completion event emitted per qualifying conversation** (`turn`-table-derived) for WAR funnel measurement.

### Out of scope (explicit non-debt)

- **Memory recall in-turn** — Aura's responses do NOT yet reference prior conversations. That's AUR-3's job. AUR-2 ships with a fresh-context reflection loop; memory wiring is the AUR-3 promotion's first work.
- **Multi-conversation sidebar / parallel threads** — that's AUR-4. AUR-2 has ONE persistent thread per user.
- **Comprehensive funnel taxonomy + ratings capture (Clarity / NPS surveys)** — deferred to a separate story per portfolio anti-scope decision (Q2 anti-scope: "ratings + clarity-score + NPS capture flows").
- **LLM-based crisis classifier** — keyword v1 suffices for first cohort; LLM upgrade is its own bet (likely a continuous-improvement bet).
- **Public app-store submission** — TestFlight + Internal Track only per portfolio Deliberately-out-of-MVP.
- **Languages beyond English + Hindi** — ramp languages (Ta/Te/Bn/Mr/Kn) gated by per-language eval per R-SPEECH.
- **Background / push-notification re-engagement** — explicitly anti-engagement per R-PORTFOLIO-3 stance; no notifications in v1.

## Open questions for Researcher

These get answered either in the AUR-2 architecture work (`/create-bet-architecture AUR-2`) or in the first story (the empirical eval), not in this brief. Logged here so the Researcher engagement on those phases inherits them:

1. **Sarvam AI conversational-Hindi performance** at our specific workload shape (1-2 minute monologue chunks, code-switched, mobile mic). The published Sarvam benchmarks are on read-aloud / dictation corpora, not reflective monologue. Need empirical numbers from our own audio.
2. **Code-switching frequency in target personas.** How often does a Hindi-primary user code-switch to English (especially for emotional words like "anxious," "burnout," "boundary")? Affects ASR provider choice (Sarvam excels here per architecture amendment, but unvalidated empirically).
3. **Crisis-classifier red-team corpus** — does an open-source vernacular crisis-language corpus exist (Hindi suicide-ideation language, distress indicators)? If not, we need to construct one in-house — likely a Sprint 1 deliverable.
4. **Tele-MANAS handoff modality** — does the helpline accept warm-transfer integration (we can dial directly from the app), or is the modality "show the number, user dials" only? Affects escalation UX design.
5. **First-turn latency budget** — architecture says P95 ≤3.5s end-to-end. Decomposition: ASR (~500ms) + LLM call (~1.5s) + TTS (~800ms) = 2.8s best case; what's the realistic P95 on Indian mobile + Sarvam + AI Gateway? Eval data tells us.
6. **System prompt eval methodology** — how do we measure "reflective quality" of LLM responses in Hindi quantitatively? Likely: human rubric scored on 50-100 sample conversations per language; need to design the rubric.
7. **Cost-per-session model.** Single-digit-rupee per session is the back-of-envelope from R-SPEECH-2. Need actual measurement from the eval to confirm the ≤₹20/WAR/mo ceiling holds at 8-10 sessions per WAR per month.

## Research findings

Synthesized from inherited foundation + portfolio + architecture context. **Not a fresh research effort** — that lives in the first story (pre-MVP eval). New evidence below where the foundation docs were thin.

**On vernacular voice quality (inherited from architecture R-SPEECH + 2026-05-26 amendment):**

- AI4Bharat's IndicASR / IndicTTS models are academically strong on Indic-language benchmarks (clean speech, single speaker). Sarvam AI ships the same model lineage on production SaaS infrastructure.
- The Bhashini platform (gov-ops layer) was rejected 2026-05-26 due to reported operational unreliability — see architecture amendment DRI.
- Empirical performance on conversational + code-switched audio is **not validated**. R-SPEECH is the gating risk; first story under AUR-2 is the eval.

**On reflective-counsel conversation shape:**

- Direct prior art is thin. Closest analogues: Wysa (chat-based, English-primary, India), Replika (chat-based, English-primary, engagement-maximizing), Tele-MANAS (human-counselor helpline, no AI), Astrotalk (paid advisors, advice-giving, not reflective). None ship the combination Aura needs (voice + vernacular + reflective + free + safety-gated).
- Reflective-questioning UX research is mostly therapist-training literature (motivational interviewing, Socratic dialogue, IFS, etc.). Need to extract the operational patterns that translate to a chatbot prompt — this is a system-prompt-engineering task, likely 2-3 iterations.

**On crisis detection in vernacular AI counsel:**

- Tele-MANAS (`14416`) is India's government mental-health helpline — public, free, 24/7. Established 2022. Architecture v1 inherits Tele-MANAS as the escalation surface; no separate vendor risk here.
- Crisis-language detection in Hindi is harder than English — fewer pre-built classifiers, fewer red-team corpora. Keyword v1 (seeded from `packages/core/safety/keywords.ts`) is a deliberate floor — minimum viable safety, not the ceiling.
- Industry pattern for crisis safety in AI products: keyword + LLM-based double-check + human-review pipeline. We ship keyword v1 only; LLM-classifier upgrade tracked as post-MVP bet.

**On the anti-engagement stance (R-PORTFOLIO-3):**

- This bet is the place to operationalize anti-engagement. The system prompt should encourage closure ("ready to step away?") not extension ("tell me more"). Re-engagement notifications are out of scope. WAR-as-metric is reframed: success is users completing a session and going away, not stayingby for hours.
- This is NOT yet in product v2's metrics (product v2 lists DAU/MAU as a defensibility proxy — contradicts the stance). R-PORTFOLIO-3 carries the open product-amendment question; AUR-2 ships against the anti-engagement stance regardless.

## User pain input (from Support)

N/A pre-launch. Will populate after first TestFlight cohort produces feedback.

## Stories

Decomposed one at a time via `/create-story AUR-2`. Likely sequence (each ~1 sprint):

1. **Pre-MVP voice quality eval (Story 1)** — gating story per R-PORTFOLIO-1 / R-SPEECH. Collect 50-100 reflection-style Hindi samples + 50 English. Run through Sarvam ASR + TTS; measure WER, MOS, latency, code-switching. Compare against Whisper for English (with DPDPA caveat — Whisper isn't India-region). Outcome: pass/fail decision on Hindi launch; documented eval methodology for ramp languages.
2. **Sarvam wiring + DR fallback runbook (Story 2)** — wire `packages/ai/src/speech.ts` against Sarvam; draft self-hosted AI4Bharat OSS DR runbook (R-SPEECH-2 mitigation; required before TestFlight invites).
3. **Conversation loop + reflective-counsel system prompt (Story 3)** — the core ASR → LLM → TTS loop. System prompt v1 in `packages/ai/prompts/system.ts`. Multi-iteration testing on Hindi + English.
4. **Crisis classifier v1 + Tele-MANAS escalation card (Story 4)** — keyword-classifier wiring + escalation UI + audit_log writes. Red-team test suite ships here.
5. **Reflection-session completion event + WAR-funnel instrumentation (Story 5)** — emit the qualifying event when ≥3 turns + closure/clarity-moment lands.

This is a **likely** decomposition. PM decomposes one story at a time per workflow; story IDs assigned at each `/create-story` invocation.

## Scan summary

To be populated by `/scan AUR-2` at next phase advance.

- **Last scanned:** N/A (brief just promoted; pre-scan)
- **Current phase:** Product (brief approval)
- **Open findings:** unknown (scan pending)
- **Suppressed:** 0
- **Blocking advance:** unknown
- **Full report:** [`scan-report.md`](./scan-report.md) (prior stub-state findings; expect post-promotion rescan to clear most)

## Check-in log

_Populated automatically by `/measure` cron after bet enters in-build._

## DRI Log

### Decisions

- [2026-05-24] [PM] Created as portfolio stub with crisis safety folded in (per [portfolio.md § DRI Decision #1](../../foundation/portfolio.md)). Full Decisions seeded on promotion.

- [2026-05-27] [PM] **Architecture required: TRUE.** AUR-2 has significant architectural complexity (speech provider integration with DR fallback, ASR → LLM → TTS pipeline orchestration, per-turn crisis classifier in the request path, cost-tier model routing in AI Gateway). `/create-bet-architecture AUR-2` runs next, before any story decomposition.
  - **Rationale (required):** Per workflow `architecture_required` decision criteria — multiple new providers integrated, latency budget under 3.5s P95 requires architectural care, crisis detection synchronous-in-path is a design choice that ripples through every story. Not amenable to "decide at the story level."
  - **Area (required, tag):** product / sequencing.
  - **Alternatives considered (required):** `architecture_required: false` (rejected — speech-pipeline orchestration is real architectural work, not just plumbing); skip bet architecture and design per-story (rejected — would duplicate work across 5 stories that all share infrastructure decisions).
  - **Reversibility:** easy — architecture phase is documentation, doesn't preclude future amendment.

- [2026-05-27] [PM] **First story is the empirical eval, not the conversation loop.** Per R-PORTFOLIO-1 / R-SPEECH gating: voice quality validates before we invest in the conversation pipeline. If Hindi fails the eval, we redirect the bet (ship English-only first, OR architecture v3 amendment to switch provider) rather than discover the failure mid-build.
  - **Rationale (required):** The Researcher Decision in portfolio.md flagged AUR-2's highest-novelty-risk piece as the speech-quality assumption. Front-loading that risk discovery is what discipline looks like; building the LLM pipeline before knowing if users can be heard would be a waste if Sarvam fails the bar.
  - **Area (required, tag):** product / sequencing / risk.
  - **Alternatives considered (required):** Build the LLM + system-prompt work first while eval runs in parallel (rejected — they're not actually parallel; the eval's result changes the architecture, so building against an architecture that may need amendment is wasteful); skip the eval and trust Sarvam's published numbers (rejected — Sarvam's benchmarks aren't on our workload).
  - **Reversibility:** easy — story sequencing is a PM decision per `/create-story`.

- [2026-05-27] [PM] **Reflection Session completion rate ≥40% as the primary key_metric.** Same target as AUR-1's onboarding completion rate, not coincidentally — the funnel needs end-to-end conversion. If onboarding lands at 40% AND AUR-2 lands at 40%, the WAR pipeline produces ~16% of first-opens reaching repeat-week reflection-session — still meaningful at TestFlight scale (~50 users = ~8 weekly reflectors). Higher ambition (60%+) at TestFlight cohort is speculative without validation.
  - **Rationale (required):** Conservative-but-not-vanity targeting. Lower than 30% would be a falsifiable failure of the bet's hypothesis. Higher than 50% would require evidence we don't have for vernacular conversational AI at this maturity.
  - **Area (required, tag):** product / measurement.
  - **Alternatives considered (required):** 25% target (rejected — too low; would let an underperforming product call itself "winning"); 60% target (rejected — no comparable benchmark; would risk false failure-call); per-language targets (deferred — single number suffices at first cohort, refine when data arrives).
  - **Reversibility:** easy — `/measure` re-calibrates targets as data accumulates.

- [2026-05-27] [PM] **Crisis classifier v1 = keyword-based, NOT LLM-based.** Keyword v1 ships with AUR-2; LLM-classifier upgrade is a separate post-MVP bet.
  - **Rationale (required):** Cost (LLM-per-turn doubles AI spend if classifier is an extra LLM call), latency (LLM-classifier adds ~1s to turn path; pushes against 3.5s budget), and false-positive control (LLM classifiers in early stages produce false alarms that erode user trust). Keyword v1 has known limitations (misses ambiguous distress, false-negatives on metaphorical language) but is auditable, fast, and cheap. The architecture decision (`docs/foundation/architecture.md` § Crisis detection) chose synchronous in-path classification; keyword is the most defensible v1 of that.
  - **Area (required, tag):** safety / cost / latency.
  - **Alternatives considered (required):** LLM-only classifier (rejected per above); no classifier (NOT considered — non-shippable per product § Guardrails); human-review post-flag (rejected — async, breaks same-session escalation guarantee).
  - **Reversibility:** easy — classifier interface lives behind `packages/ai/src/safety.ts`; upgrading to LLM-based is a swap-in.

### Risks

- [2026-05-24] [Researcher] Inherits R-PORTFOLIO-1 (speech-provider conversational-quality assumption unvalidated — provider amended 2026-05-26 from Bhashini to Sarvam AI per architecture SUPERSEDES decision; quality risk shape unchanged) — see [portfolio.md § DRI Risks](../../foundation/portfolio.md). First story under this bet must be the pre-MVP quality eval against Sarvam, with Whisper + native speech APIs evaluated for English.

- [2026-05-26] [Engineer / Vivek] Inherits R-SPEECH-2 (vendor concentration + cost-floor with Sarvam-primary) from architecture amendment — see [architecture § DRI Risks 2026-05-26](../../foundation/architecture.md). First story or a dedicated DR-runbook story must produce a self-hosted-AI4Bharat-OSS fallback runbook before AUR-2 ships to TestFlight.

- [2026-05-27] [PM] **R-AUR-2-1: Reflective-counsel system prompt drift risk.** A non-reflective LLM (Claude or GPT-4o) defaults to advice-giving (helpful assistant behavior). The reflective questioning system prompt is fighting the model's training. Risk: prompt regressions silently shift Aura toward advice-giving over reflective questioning — undetected because we have no automated quality eval for response shape.
  - **Likelihood (required):** high (this is the default-failure-mode for any LLM-based counselor product; well-documented industry pattern).
  - **Impact (required):** high (advice-giving Aura is a different product; loses the "patient friend" brand position; loses the reflective-questioning differentiator; arguably becomes regulatory risk in a counseling context).
  - **Mitigation (required):** (1) System prompt versioned in `packages/ai/prompts/system.ts` with semver-style versioning + DRI Decision on every change. (2) Quality eval rubric (human-scored) as part of every prompt version bump — sample 20 conversations through new prompt before deploy. (3) Sentinel test suite — known conversational prompts that MUST elicit reflective questions (not advice) — runs in CI before every prompt deploy. (4) Audit-log every prompt-version change with the rationale.
  - **Area (required, tag):** ai / prompt-engineering / brand.

- [2026-05-27] [PM] **R-AUR-2-2: Crisis-classifier false-positive fatigue.** Keyword v1 may flag too many non-crisis conversations as crisis (a user describing a movie character's despair, a discussion of a friend's situation, metaphorical language). Each false positive shows the Tele-MANAS escalation card → user dismisses it → trust in the safety system erodes → real crises later get dismissed as "another false alarm."
  - **Likelihood (required):** medium-high (keyword classifiers have well-known recall/precision tradeoffs; precision ≥95% is the guardrail threshold, but real-world testing may miss the bar).
  - **Impact (required):** high (the safety surface is a brand-trust load-bearing artifact; eroding it is a slow leak with delayed downstream damage).
  - **Mitigation (required):** (1) Keyword seed list (`packages/core/safety/keywords.ts`) is conservative — calibrated to precision ≥95% on the red-team corpus before launch (red-team corpus is a Story 4 deliverable). (2) Escalation card UX phrased gently — not "you're in crisis, call now" but "if you'd like to talk to someone trained, here's a number." (3) Audit-log every flag → analyze weekly during early cohort → tune keyword list. (4) Plan for LLM-classifier upgrade post-MVP once first cohort produces baseline precision data.
  - **Area (required, tag):** safety / classifier / trust.

- [2026-05-27] [PM] **R-AUR-2-3: First-month cost spike vs ≤₹20/WAR/mo ceiling.** Sarvam (paid per-minute), AI Gateway / Claude (per-token), and TTS (per-character) all introduce real per-session costs that scale with usage. Unlike AUR-1 where costs were fixed (database, hosting), AUR-2's costs are usage-driven. Early TestFlight cohort may exhibit unusual usage patterns (founders showing off the product = long sessions, friends-and-family = exploratory sessions). First-month cost actuals may exceed the WAR-ceiling baseline by 2-3×.
  - **Likelihood (required):** high for first month (small N + atypical usage); medium thereafter (real users typically use less, not more).
  - **Impact (required):** medium (ceiling has headroom — single-digit-rupees per session at 8-10 sessions = ₹40-150 per heavy user vs ₹20 ceiling; the ceiling is a 100K-WAR ceiling, not a 50-user ceiling); high if the pattern doesn't normalize (would force architecture v3 amendment for cost containment).
  - **Mitigation (required):** (1) Per-turn cost telemetry into Vercel Observability from Day 1 of AUR-2 (per architecture amendment R-SPEECH-2 mitigation). (2) Weekly rolling-7-day cost-per-WAR dashboard during TestFlight. (3) Alert threshold: rolling 7-day average > ₹15/WAR/mo triggers a re-architecture conversation. (4) Cost-aware model routing in AI Gateway: short / non-critical turns use Haiku/4o-mini; emotional or crisis-adjacent turns use Sonnet/4o.
  - **Area (required, tag):** cost / vendor / architecture.

- [2026-05-27] [PM] **R-AUR-2-4: Anti-engagement stance contradicts default LLM training.** The R-PORTFOLIO-3 stance (Aura succeeds when users reach clarity and step away) is fighting two product gravitational forces: (a) LLMs are trained to be maximally helpful = keep talking; (b) the product's measured metric (WAR) is incidentally an engagement metric. Without explicit prompt + UX work, AUR-2 will produce an engagement-maximizing experience by default.
  - **Likelihood (required):** high (this is the path-of-least-resistance failure mode).
  - **Impact (required):** medium (doesn't make AUR-2 unshippable but compromises brand position; eats into the "Cursor for users" thesis).
  - **Mitigation (required):** (1) System prompt explicitly includes closure-encouraging language ("Have we landed somewhere useful? It's OK to step away."). (2) After every ~3-turn cluster, the LLM is prompted to offer closure as a default. (3) No push notifications, no daily streaks, no "come back" hooks (architecturally enforced — those code paths don't exist in AUR-2). (4) Cohort behavior tracked: session-length distribution; if median session is >15 min, prompt is failing closure-encouragement.
  - **Area (required, tag):** product / brand / measurement.

### Issues

- [2026-05-24] [Scanner] **Stub-state Product-phase findings raised by [SCAN-AUR-2](./scan-report.md) (2026-05-24).** Composite Issue tracking 6 open findings (2 Critical / 3 High / 1 Medium) — all share root cause `portfolio_stub: true`; not yet promoted via `/create-brief`.
  - **Severity (required, mandatory):** Critical (highest finding severity — PROD-01 + PROD-04, both non-suppressible).
  - **Owner (required, mandatory):** PM.
  - **Status:** **resolved 2026-05-27** — stub promoted via this brief; re-run `/scan AUR-2` to confirm findings cleared.
  - **Area (required, tag):** product / scanner.
  - **Resolution path:** Re-run `/scan AUR-2` to confirm findings closed (expect 0 product-phase findings after this brief is approved).
  - **Findings:** See [`scan-report.md`](./scan-report.md) for full list (PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-07).

- [2026-05-27] [PM] **AUR-2 cannot begin BUILD until AUR-5 (under AUR-1) fully ships and Sarvam quality eval (Story 1 of AUR-2) passes.** Two hard gates.
  - **Severity (required, mandatory):** P0 (sequencing constraint; not a defect).
  - **Owner (required, mandatory):** PM (gating decision) + Vivek (Sarvam eval execution).
  - **Status:** open (sequencing constraint, not actionable as a "bug"; flagged for awareness).
  - **Area (required, tag):** process / sequencing.

- [2026-05-27] [PM] **R-PORTFOLIO-3 (anti-engagement stance not in product v2 metrics) is now load-bearing.** Without resolving this — either via product v3 amendment OR via AUR-2 brief locking in alternative metrics — AUR-2 will be measured against engagement-maximizing defaults (DAU/MAU listed as moat proxy in product v2) which contradicts the bet's design. Surfaced at portfolio level but unresolved.
  - **Severity (required, mandatory):** P1 (doesn't block code, blocks honest measurement post-launch).
  - **Owner (required, mandatory):** PM (escalate to product v3 decision when first AUR-2 cohort data lands).
  - **Status:** open. Resolution path: defer until first cohort produces session-length + return-rate data; then revisit product v2 metrics (drop DAU/MAU as moat proxy; add closure-rate / time-to-clarity / unsubscribe-as-success).
  - **Area (required, tag):** product / metrics / brand.

---

_Approved by: Vivek on 2026-05-28._
