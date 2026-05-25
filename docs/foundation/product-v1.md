---
id: FOUNDATION-PRODUCT
type: foundational-product
version: 1
status: superseded
created: 2026-05-23
approved: 2026-05-23
approved_by: Vivek
superseded: 2026-05-24
superseded_by: product.md (v2)
author: PM
sources:
  - https://docs.google.com/document/d/1pC6uR9ho8tloZ6aUrh_6Q952wBW_TN2sFBRWC0i8-Ak
parent: null
key_metric:
  name: Weekly Active Reflectors (WAR) — users who completed ≥1 reflection session in the trailing 7 days
  baseline: 0 (pre-launch)
  target: 100,000 WAR by month 12; D30 retention ≥ 25%
  source: product analytics (TBD in foundational architecture bet)
measurement_window_months: 12
check_in_cadence: quarterly
---

> **SUPERSEDED 2026-05-24.** This is v1, preserved for traceability. Active version: [`product.md`](./product.md) (v2). v2 amendments: (a) ship free at the user level in v1, deferring the pricing decision to post-100K WAR; (b) clarified the ≤₹20 guardrail was always the architectural cost ceiling, not a user-facing price.

# Foundational Product Bet — Aura (v1, superseded)

> The product mission, as a measurable wager.

**Research basis:** see [`docs/foundation/research.md`](./research.md). Every claim below is grounded there.

## Vision

Aura is the friend the 536 million underserved Indians never had — a patient, non-judgemental, vernacular AI counsel that helps a person hear themselves clearly when they face decisions about career, relationships, money, and meaning. Aura does not advise. It asks the right question, in the language the user thinks in, at a price (sub-₹20/month) below what any human counsel could ever scale to. If we succeed, clarity stops being a privilege.

## Target users / personas

Three primary personas, all sharing: smartphone-first, vernacular-first, never had structured access to a mentor or counsel:

1. **The first-decision graduate.** Recently entered college or first job. Tier 2/3 city. First in family to navigate a white-collar trajectory. Decision context: course choice, internship choice, first salary negotiation, "should I move cities." Today goes to: family elders, astrologers, YouTube creators, ChatGPT in English (struggles).
2. **The mid-life pivot.** 30–45, formal or informal sector. Decisions about marriage, money, switching jobs, supporting parents, kids' education. Mobile-fluent, English-limited. Today goes to: spouse, astrologer, a sibling who "made it," nobody.
3. **The informal-sector worker.** Vision's stated "office cleaner in Chennai." Earns ₹15–30K/month. Smartphone-native (4.7 hrs/day average mobile use in India). Decisions about family, money, work, health. Today: largely alone with these decisions. **Persona validation pending qualitative work — see Risk R1.**

Out of persona (we do not serve, this version): clinical mental-health cases; English-first metro professionals already served by Wysa/YourDost/BetterHelp; B2B (workplace EAP, university wellness).

## Market positioning

Aura sits in a position no current product occupies:

| Axis | Aura | Western AI companions (Replika, Pi) | Indian wellness apps (Wysa, YourDost) | Astrology apps (Astrotalk) | Tele-MANAS |
|------|------|--------------------------------------|----------------------------------------|------------------------------|------------|
| Language | Vernacular-first | English-first | English-default | Vernacular | Vernacular |
| Pricing | < ₹20/mo | ~$10–20/mo | ~₹500/mo (Wysa Premium) | Per-minute paid calls | Free |
| Mechanism | Reflective questioning | Companion / friend | Clinical CBT/DBT | Mystical prediction | Clinical helpline |
| Memory | Persistent life-story | Per-session / shallow | Episodic | None | None |
| Cultural fit | Indian decision context | Western therapy idiom | Western therapy idiom | Deep Indian, mystical | Clinical |
| Always available | Yes | Yes | Limited (sessions queued) | Marketplace availability | Wait times |

**The contested neighbour is Astrotalk** — ₹1,182 cr revenue FY25, ~35M users, the *actual* product Aura's users use today when they want guidance on a decision. Aura competes here on substance (reasoned reflection) rather than substituting one form of belief for another.

**The credibility ceiling is Wysa** — FDA Class II, NHS partner, JMIR clinical evidence. We are not clinical; we will not pretend to be. But the safety bar Wysa established is the floor we operate above.

## North-star metric

**Weekly Active Reflectors (WAR)** — count of unique users who completed ≥1 reflection session (defined as: ≥3 meaningful turns in a single conversation that the user ended explicitly or that produced a saved "clarity moment") in the trailing 7 days.

**Why this metric:**
- *Pairs scale with depth.* Raw MAU rewards opening the app; WAR rewards engaging with intent.
- *Proxies the vision.* "Hearing themselves clearly" maps to completed reflection, not session count.
- *Falsifiable.* A product that grows MAU but not WAR has failed the vision even if commercially successful.

**Year-1 target:** 100,000 WAR. (Astrotalk reached 35M MAU over multiple years; Wysa has 1M+. 100K WAR is ~ Wysa's order-of-magnitude in year 1, with deeper engagement implied.)

## Strategic OKRs

### Annual (12 months from approval)

- **Objective 1:** Prove Aura is something underserved Indians return to of their own volition.
  - KR 1: 100,000 Weekly Active Reflectors by month 12.
  - KR 2: D30 retention ≥ 25% (lower bound of AI-companion category benchmark, see Research F5).
  - KR 3: Self-reported clarity score ≥ 4.0 / 5.0 across ≥ 1,000 post-session ratings.

- **Objective 2:** Earn user trust as the non-judgemental, vernacular, fair-priced counsel.
  - KR 1: NPS ≥ 40 among users with ≥ 30 days tenure.
  - KR 2: Zero P0 trust incidents (data misuse, harmful advice, unauthorized monetisation).
  - KR 3: ≥ 60% of WAR using a non-English language as primary interface.

### Current quarter (Q3 2026 — first quarter post-approval)

- **Objective:** Stand up the product foundation that the year-1 bet depends on.
  - KR 1: Foundational architecture bet (`/setup-foundation-architecture`) approved.
  - KR 2: First feature bet (likely: vernacular voice reflection MVP) brief approved.
  - KR 3: Persona validation field work (10–20 qualitative interviews) commissioned and findings logged.

## Hypothesis (the bet)

> If we build a vernacular, mobile-first, sub-₹20/month AI counsel grounded in reflective questioning and persistent memory of the user's story, then underserved Indians (Tier 2/3, vernacular-first, currently un-mentored) will return to it weekly to think through real decisions — measured by **100,000 Weekly Active Reflectors with D30 retention ≥ 25% and clarity score ≥ 4.0/5.0 within 12 months of launch.**

## Defensibility / Moat

If this bet wins, what stops competitors from catching up?

| Moat type | Applies? | Evidence / rationale |
|-----------|---------|---------------------|
| Network effects | partial | Direct: no (1:1 friend, no value from other users in your conversation). Indirect (data network effect): yes, but folded into "Data / proprietary intelligence" below. |
| Switching costs | yes (primary) | The user's life story lives in Aura's memory. Switching = losing the entity that knows you. Wysa retention + AI-companion category D30 of 13–50% (vs 5% norm) empirically validate this dynamic. The memory layer is the durable lock-in. |
| Data / proprietary intelligence | yes (primary) | Vernacular emotional-decision conversations at Indian-cultural scale = a training corpus no Western LLM has and no Indian incumbent (Astrotalk's astrology call data is a different domain) aggregates. Compounds as WAR grows. |
| Scale economics | partial | Open-source India stack (AI4Bharat IndicASR/IndicTTS, Bhashini, Sarvam) lets inference cost approach floor with scale. Real, but competitors can use the same stack — not strategically defensible alone. |
| Brand / trust | yes (primary) | In emotional counsel, trust *is* the product. Aura's promise — non-judgemental, vernacular, fair-priced, doesn't sell to you — is a deliberate, slow-to-copy positioning play. Brand here compounds with switching costs (you trust the friend who already knows you). |
| Regulatory / certification | no (deliberate) | Wysa's FDA/NICE path is the credibility ceiling but not our route — we are not clinical and will not pretend to be. DPDPA compliance is table stakes, not a moat. |
| Distribution / channel | partial (option) | NGO partnerships, employer/EAP integration, vernacular creator economy. Not a Day-1 moat; preserved as a future option. |
| Talent / domain expertise | partial | Indian-language NLP + culturally-attuned conversation design + emotional-safety engineering is a rare intersection. Helpful, not durable (talent is mobile). |
| Speed / iteration velocity | no | Vision explicitly does not bet on out-execution. The classic founder fallacy; correctly avoided. |

**Primary moat(s) we're betting on:** **Switching costs (memory) + Data / proprietary intelligence (vernacular decision corpus) + Brand / trust (non-judgemental, fair-priced positioning).** These three compound: a brand promise that earns trust → users invest their story → that story trains a model only Aura can train → which deepens the trust → which raises switching cost.

**Defensibility proxy metrics (where applicable):**
- D30 retention (proxy for switching cost — primary, in north-star above).
- DAU/MAU ratio (proxy for habituation — track from launch).
- Median "story depth" — count of distinct life topics referenced in user memory after 30 days (proxy for data moat richness).
- Time-to-replicate: ~24 months for a well-resourced competitor to replicate vernacular AI counsel with comparable cultural depth, *assuming they start now*. Aura's head start is the operative variable.

## Guardrail metrics

What must NOT degrade for this bet to count as won:

- **Trust:** Zero P0 incidents (data misuse, harmful advice, unauthorized monetisation, model giving clinical-grade advice).
- **Safety:** ≥ 99% of conversations flagged for crisis indicators (self-harm, abuse) receive a Tele-MANAS / domain-appropriate escalation within the same session.
- **Affordability:** Median user cost / month ≤ ₹20. If unit economics force this above ₹20, the bet has failed even if WAR hits target.
- **Language equity:** No single language accounts for > 60% of WAR by month 12. (Hindi-only does not validate vernacular thesis.)
- **Cultural appropriateness:** ≤ 5% of post-session surveys flag "felt foreign / didn't get me culturally."

## Scope

### In scope

- Reflective conversation in ≥ 6 Indian languages by month 12 (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada minimum).
- Voice-first interface (vernacular voice is the unlock per Research F2).
- Persistent memory of the user's life story (the moat).
- Decisions across career, relationships, money, meaning — the four domains in the vision.
- Always-on availability.
- Privacy-by-default, end-to-end story ownership by the user (DPDPA-aligned).
- Safety escalation to Tele-MANAS / appropriate helplines on crisis indicators.

### Out of scope (never)

- **Clinical diagnosis or therapy.** We are not a therapist, not a doctor, not a medical device. We do not treat depression, anxiety, or any DSM condition. We escalate.
- **Crisis intervention as primary mode.** We are a companion for ordinary decisions. Crisis routes to Tele-MANAS and equivalents — always.
- **English-first product.** English is supported as one language; never the default. A user opening Aura should not see English unless they chose it.
- **Advice-giving / decision-making for the user.** Aura asks; the user decides. Any tone shift to "you should do X" is a vision violation.
- **Astrologer / counsellor marketplace model.** We do not become Astrotalk for therapists. The product is *the AI counsel*, not a discovery surface for paid human providers.
- **Selling user data, ever.** No ads targeted by conversation content. No data sales. No "anonymous aggregate" data licensing. Aura's trust moat dies on the day this rule bends.
- **B2B (this version).** No EAP, no university partnerships, no white-label. These are tempting and explicitly deferred — they would force product compromises that break the consumer trust thesis.

## Check-in log

_Populated automatically by `/measure` cron._

## DRI Log

### Decisions

- [2026-05-23] [PM] North-star metric is Weekly Active Reflectors (WAR) — not MAU.
  - **Rationale (required):** MAU rewards opening the app; WAR rewards engaging with intent. The vision is "hearing themselves clearly," which maps to completed reflection, not session count. A product that grows MAU but not WAR has failed the vision. AI-companion incumbents (Replika, Character.AI) demonstrate the MAU-without-depth failure mode.
  - **Area (required, tag):** product / measurement.
  - **Alternatives considered (required):** raw MAU (rejected — proxy for vanity); D30 retention alone (rejected — important guardrail but not a north-star); revenue per user (rejected — premature; vision prioritises access).
  - **Reversibility:** medium — changing the north-star later is possible but would re-baseline a year of measurement.

- [2026-05-23] [PM] Bet primary moats on switching costs + data / proprietary intelligence + brand / trust.
  - **Rationale (required):** Researcher analysis across all 9 moat types ([research.md](./research.md) § Moat) identified these three as the only moats that compound in this category. Switching cost is the memory layer; data moat is the vernacular decision corpus; brand is the trust-as-product play. Speed-as-moat explicitly rejected per vision.
  - **Area (required, tag):** product / strategy.
  - **Alternatives considered (required):** regulatory moat (Wysa playbook) — rejected as it conflicts with mass-market accessibility; distribution moat (NGO/EAP) — preserved as option but not Day-1.
  - **Reversibility:** hard — primary-moat selection shapes architecture, monetisation, and brand for years.

- [2026-05-23] [PM] Explicitly exclude clinical positioning, English-first UX, astrologer-marketplace model, and B2B from Day-1 scope.
  - **Rationale (required):** Each is an adjacent revenue path that would compromise the vision. Clinical = Wysa territory and triggers regulatory burden; English-first = abandons the persona; marketplace = becomes Astrotalk; B2B = forces enterprise-shaped product compromises that break consumer trust thesis.
  - **Area (required, tag):** product / scope.
  - **Alternatives considered (required):** leave out-of-scope ambiguous (rejected — ambiguity invites scope creep under revenue pressure).
  - **Reversibility:** medium — these can be added later as separate bets if the foundational bet proves out.

- [2026-05-23] [PM] Foundational architecture bet (separate workflow) is gated on approval of this product bet.
  - **Rationale (required):** Per `compass/config.yaml` `setup.enforce_product_before_architecture: true`. Architecture decisions must inherit product constraints.
  - **Area (required, tag):** process.
  - **Alternatives considered (required):** parallel-track (forbidden by config).
  - **Reversibility:** one-way (procedural rule).

### Risks

- [2026-05-23] [PM] R1 — Persona validation gap: vision's "informal-sector Indian" persona is not validated by current research.
  - **Likelihood (required):** high.
  - **Impact (required):** high (entire vision could be persona-mismatched).
  - **Mitigation (required):** Q3 OKR KR3 commissions 10–20 qualitative interviews before foundational architecture freezes. If field work invalidates the informal-sector persona, return to foundational product bet for amendment (creates v2 per workflow rules).
  - **Area (required, tag):** product / research.

- [2026-05-23] [PM] R2 — Cultural acceptability of AI-as-counsel for ongoing decisions (vs. crisis support) is not established.
  - **Likelihood (required):** medium.
  - **Impact (required):** high (adoption ceiling).
  - **Mitigation (required):** Fold acceptance signal into persona validation work. Watch Tele-MANAS adoption trajectory as institutional-trust proxy. Build human-handoff path (escalation, not just crisis) into MVP.
  - **Area (required, tag):** product / culture.

- [2026-05-23] [PM] R3 — Unit economics at sub-₹20/month require open-source-stack inference cost discipline; falling back to GPT-4-class API per turn would break the price thesis.
  - **Likelihood (required):** medium.
  - **Impact (required):** high (kills the affordability guardrail).
  - **Mitigation (required):** Constraint flows to foundational architecture bet — explicit requirement to design on AI4Bharat / Bhashini / Sarvam stack with cost ceiling per WAU. Architect to size budget per turn before committing to stack.
  - **Area (required, tag):** product / architecture / economics.

- [2026-05-23] [PM] R4 — AI safety in emotional-counsel category is non-trivial; harmful-advice incidents can be existential to brand moat.
  - **Likelihood (required):** medium.
  - **Impact (required):** high (P0 trust guardrail).
  - **Mitigation (required):** Crisis escalation path must be MVP-mandatory, not Phase-2. Red-team conversation evaluations mandatory before each release. Clinical-advisor on retainer (not employee) to review escalation rules quarterly.
  - **Area (required, tag):** product / safety.

- [2026-05-23] [PM] R5 — Competitor response: if the bet shows early traction, ChatGPT/Gemini India localisation, Astrotalk diversifying into AI counsel, or a well-funded Indian-AI-companion startup are all plausible threats.
  - **Likelihood (required):** medium-high.
  - **Impact (required):** medium (moats above are designed for this, but require head-start time to compound).
  - **Mitigation (required):** Speed *to first 10K WAR with strong retention* is the operative variable for moat compounding. Quarterly competitive review by PM + Researcher.
  - **Area (required, tag):** product / competitive.

### Issues

- [2026-05-23] [PM] No product analytics infrastructure yet — measurement plan exists on paper, instrumentation is foundational-architecture work.
  - **Severity (required, mandatory):** P2 (expected at foundation stage).
  - **Owner (required, mandatory):** Enterprise/Solution Architect (carries to `/setup-foundation-architecture`).
  - **Status:** open.
  - **Area (required, tag):** measurement / infrastructure.

- [2026-05-23] [PM] Persona validation field work not yet commissioned. Logged as Q3 OKR KR3 above.
  - **Severity (required, mandatory):** P1 (foundational architecture should not freeze until validation is in.)
  - **Owner (required, mandatory):** PM (with Researcher).
  - **Status:** open.
  - **Area (required, tag):** product / research.

---

_Approved by: Vivek on 2026-05-23._
