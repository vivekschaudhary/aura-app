---
bet: FOUNDATION-ARCHITECTURE
author: Enterprise/Solution Architect
created: 2026-05-23
parent: FOUNDATION-PRODUCT
---

# Architecture Research — Aura

Evidence base for [`docs/foundation/architecture.md`](./architecture.md). Findings organised per the 6-category architecture-research framework in `compass/roles/enterprise-architect.md`. Every stack choice in the architecture bet cites ≥1 finding from this document.

---

## 1. Prior art

Comparable workloads — vernacular consumer AI, mobile-first emotional/decision support, small-team stacks — and the stacks they shipped on.

### A. Wysa — Indian-origin AI mental wellness app, 1M+ users, FDA Class II
- Built on a polyglot stack (mobile RN + backend services) with managed cloud infra. NHS-partnered, JMIR-published clinical evidence. Demonstrates that AI counsel at meaningful scale (1M+) is shippable from India with a small team.
- **Implication for Aura:** validates the conversational-AI shape, validates that emotional-AI at scale is feasible without resume-driven exotic infra.
- [Wysa Clinical Evidence](https://www.wysa.com/clinical-evidence)

### B. Replika, Character.AI — Western AI companions, 20M+ users
- Replika: ~20M users, $24M ARR 2024, persistent-memory model (the comparable moat shape). Character.AI: $32M ARR 2024 with comparable architecture.
- Both rely on hosted LLM provider stacks with custom memory layers — not self-hosted models for primary reasoning.
- **Implication for Aura:** persistent-memory + hosted-LLM-orchestration is the dominant shape for this category. No incumbent in this space has won by going self-hosted on day one.
- [Replika AI Statistics](https://nikolaroza.com/replika-ai-statistics-facts-trends/); [ElectroIQ AI Companion Stats](https://electroiq.com/stats/ai-companions-statistics/)

### C. World Journeys — Production Turborepo + Expo + EAS Update case study
- Maintains 3 separate iOS/Android apps from one codebase, automatic OTA updates per tenant via EAS Update + GitHub Actions matrix. Proven small-team scaling pattern.
- **Implication for Aura:** Turborepo + Expo + EAS Update is a documented working architecture for a small-team mobile-first product with rapid iteration needs.
- [Tech @ EF — Multi-Tenancy with Turborepo + Expo](https://www.eftech.com/blog/posts/multi-tenancy-in-react-native-with-expo-turborepo)

### D. tRPC migration case — Apollo Federation → tRPC
- Production migration: 89% bug reduction, 67% faster response times, 2.4M daily requests, 99.97% uptime — single-team product context (closest analogue to Aura's solo-to-3 team).
- **Implication for Aura:** tRPC is a proven contract format for single-team TypeScript products at meaningful scale.
- [InfoQ — Building Production-Ready tRPC APIs](https://www.infoq.com/articles/building-trpc-api-typescript/)

### E. Passkey / WebAuthn — mass-market consumer adoption 2025–2026
- Passkey-ready Android (Chrome + Credential Manager): **97% as of March 2026.** iOS web ~**99% by end of 2025.** macOS ~91%.
- Android 14+ ships **Credential Manager** as the system entry point — unifies passkey + password UI across supporting apps.
- On Android, passkeys live by default in Google Password Manager, biometric-protected. iCloud Keychain syncs across Apple devices.
- Passwordless authentication market: **$24.1B in 2025**, 18.24% CAGR to $55.7B by 2030.
- UX learning: **auto-triggering biometric enrollment on mobile lifts adoption 30–50%** vs manual opt-in.
- Government deployments at scale: Australia + New Zealand have made passkeys available to nearly 30M people.
- **India-specific note (verify scope):** reports of an India regulatory deadline of April 1, 2026 for transitioning away from SMS OTP authentication. Likely scoped to financial services / RBI-regulated entities rather than all consumer apps — must verify before treating as load-bearing. Regardless, the directional signal is that SMS OTP-as-primary is being deprecated in India's regulatory direction.
- **Implication for Aura:** passkey-primary auth is no longer leading-edge — it is mainstream in 2026. Mass-market mobile-device readiness in India is high (~97% on Android, ~99% on iOS), with a credible OTP fallback for the residual ~3–15% gap.
- [State of passkeys 2025 (Biometric Update)](https://www.biometricupdate.com/202501/state-of-passkeys-2025-passkeys-move-to-mainstream); [Passkey adoption on Android 2026](https://state-of-passkeys.io/android); [Passwordless authentication in 2025 (Authsignal)](https://www.authsignal.com/blog/articles/passwordless-authentication-in-2025-the-year-passkeys-went-mainstream); [Passkey adoption case studies — Authenticate 2025 (Corbado)](https://www.corbado.com/blog/passkey-adoption-case-studies-authenticate-2025); [10 UX patterns that drive 80%+ passkey adoption (Security Boulevard)](https://securityboulevard.com/2026/04/10-ux-patterns-that-drive-80-passkey-adoption-with-real-examples/)

---

## 2. Benchmarks

Published performance numbers under workloads close to Aura's.

### A. pgvector @ scale on Supabase
- 1M OpenAI embeddings: **~1,800 QPS at 91% accuracy** OR **~670 QPS at 98% accuracy** on standard Supabase.
- 2M vectors: comfortable on free tier.
- 10M vectors: **P95 65ms over REST API, 24ms raw pgvector over SQL.**
- 200M vectors (768-dim): production deployment requires ~850GB RAM (HNSW index in memory).
- **Implication for Aura:** at 100K WAR × avg 100 memories per user = 10M vectors → comfortably within published P95 envelope at <100ms. Memory recall fitness function (P95 ≤1.5s) has a 15× headroom over pgvector's measured latency floor.
- [Supabase pgvector 0.4.0 performance](https://supabase.com/blog/pgvector-performance); [Postgres Vector Search Benchmarks (Ronak Rathore)](https://medium.com/@DataCraft-Innovations/postgres-vector-search-with-pgvector-benchmarks-costs-and-reality-check-f839a4d2b66f); [pgvector vs Pinecone cost/perf (Supabase)](https://supabase.com/blog/pgvector-vs-pinecone)

### B. Vercel AI Gateway — Production fallback metrics (Vercel published)
- **~3.5% of requests** complete only after a fallback was triggered. Cost-weighted rescue rate 4.9%.
- AI Gateway uptime exceeds any individual upstream provider's uptime by design (counts final success after fallback).
- Zero markup on token pricing — providers' list price passes through.
- **Implication for Aura:** AI Gateway's published fallback rate (~3.5%) is the operational reality of single-provider risk we'd take on if we routed direct. Gateway recovers that risk without code changes.
- [Vercel AI Gateway production index](https://vercel.com/blog/ai-gateway-production-index); [Vercel AI Gateway uptime docs](https://vercel.com/docs/ai-gateway/models-and-providers/uptime)

### C. Vercel `bom1` Mumbai region
- 100% uptime over trailing 90 days as of search date.
- Edge runtime + compute in Mumbai region.
- **Implication for Aura:** the region exists, has measured uptime, and is operational. Latency benefit for Indian users is structural (compute close to users).
- [Vercel Mumbai (bom1) pricing](https://vercel.com/docs/pricing/regional-pricing/bom1); [Vercel regions](https://vercel.com/docs/regions); [Vercel status](https://www.vercel-status.com/)

### D. AI4Bharat IndicTTS / IndicASR quality
- IndicTTS MOS **3.6–3.9** across major Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada). Apache 2.0 licensed via Hugging Face.
- Bhashini API: free for non-commercial, discounted commercial.
- **Implication for Aura:** MOS 3.6–3.9 is in the "acceptable for production conversational use" band (not paid-content quality, but acceptable for voice counsel). Per-language quality gate is the right architectural pattern: if a language fails the MOS bar in our domain eval, ship without that language rather than degraded.
- [AI4Bharat](https://ai4bharat.iitm.ac.in/); [Bhashini](https://www.bhashini.ai/); [TTS for Next Billion Users (arxiv)](https://arxiv.org/pdf/2211.09536)

---

## 3. Vendor health

Will the technology still exist in 3–5 years? Can you hire for it?

### A. Next.js + React (Stack Overflow Developer Survey 2025, 49,000+ respondents, 177 countries)
- React + Next.js identified as leading + "framework to watch" in 2025 survey.
- TypeScript baseline assumption for hiring in 2025; "TypeScript engineer" reads as narrower than 18 months prior because employers now expect AI fluency alongside.
- **Implication for Aura:** hireability is high; ecosystem is mainstream; no resume-driven risk.
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025); [Enstacked — SO Survey Insights 2025](https://enstacked.com/stack-overflow-developer-survey-insights/)

### B. Supabase
- Open-source backend; underlying database is vanilla Postgres (migration target = any Postgres host).
- Strong release cadence; active commercial vendor.
- Self-hosting available as a fallback if commercial terms shift.
- **Implication for Aura:** vendor risk is bounded — worst case is migrate to self-hosted Postgres + alternative auth/storage components. The DB itself never gets stranded.
- [Supabase Docs — Transferring to Self-Host](https://supabase.com/docs/guides/troubleshooting/transferring-from-cloud-to-self-host-in-supabase-2oWNvW); [Supabase Alternatives 2026 (UI Bakery)](https://uibakery.io/blog/supabase-alternatives)

### C. Expo + EAS
- Expo SDK 52+ auto-detects monorepos (no Metro config bugs).
- World Journeys case study + community starters confirm production maturity in 2025/2026.
- EAS is a paid managed service from Expo (commercial vendor); falls back to bare React Native if EAS were to disappear.
- **Implication for Aura:** mature tooling; eject path exists; small risk concentration on Expo as a vendor mitigated by RN-compatible fallback.
- [Expo monorepos docs](https://docs.expo.dev/guides/monorepos/); [byCedric Expo monorepo example](https://github.com/byCedric/expo-monorepo-example)

### D. Vercel AI Gateway
- GA since August 2025. Production index and uptime dashboards published.
- Zero markup on token pricing — Vercel's revenue model is platform, not gateway-margin.
- Replaceable in days at our boundary (`packages/ai/gateway.ts`) since it speaks provider-native APIs.
- **Implication for Aura:** vendor risk is low; abstraction is shallow; replacement cost is contained.
- [Vercel AI Gateway](https://vercel.com/ai-gateway); [Vercel AI Gateway GA announcement](https://vercel.com/blog/ai-gateway-is-now-generally-available)

### E. AI4Bharat + Bhashini
- State-backed: MeitY (Ministry of Electronics and Information Technology, Govt of India) + IITs + CDAC.
- VoicERA stack announced at India AI Impact Summit 2026.
- Apache 2.0 licensing — no rug-pull risk on the open-source side.
- **Implication for Aura:** strongest vendor stability in the stack; state-aligned strategic infrastructure is unlikely to disappear over a 24-month horizon.
- [Bhashini](https://www.bhashini.ai/); [VoicERA announcement](https://edunovations.com/currentaffairs/national/voicera-ai-stack-on-bhashini/); [AI4Bharat IIT Madras](https://ai4bharat.iitm.ac.in/)

### F. WebAuthn / Passkey libraries (`react-native-passkey`, `@simplewebauthn/server`)
- **WebAuthn** is a W3C standard backed by the FIDO Alliance (Apple, Google, Microsoft as primary backers). Standards-track, not vendor-controlled.
- **`react-native-passkey`** — open-source RN wrapper around iOS `AuthenticationServices` (passkey) + Android Credential Manager. Actively maintained as of 2026. Falls back gracefully when device capability is absent.
- **`@simplewebauthn/server`** — open-source Node library for the server-side ceremony (challenge generation, attestation verification, counter management). Mature, used widely.
- **MSG91** (SMS OTP for fallback path) — India-domiciled SMS gateway, well-known in Indian consumer-app stacks; per-OTP cost ≈ ₹0.15.
- **Implication for Aura:** the entire passkey + fallback stack is open-source + standards-based + free at our scale. Vendor risk is negligible (W3C standards don't disappear). Replacement at the `packages/core/auth.ts` boundary is mechanical if any single library is abandoned.
- [W3C WebAuthn Spec](https://www.w3.org/TR/webauthn-2/); [FIDO Alliance](https://fidoalliance.org/); [react-native-passkey GitHub](https://github.com/f-prime/react-native-passkey); [SimpleWebAuthn](https://simplewebauthn.dev/)

---

## 4. Failure modes

Post-mortems where the chosen stack's class was load-bearing in the failure.

### A. Handle-only / weak-identity account takeover (ATO) — superseded by passkey adoption
- ATO cases jumped **76% in 2024**. A marketplace post-mortem documented **$4.3M lost in a Q3 2024 credential-stuffing wave.**
- Credential stuffing leverages assumption that users reuse credentials across services — handle-only auth has the same exposure shape (any handle in any breached service can be tried).
- ATO playbook industry standard: detection + containment + customer notification + recovery + post-mortem with named owners.
- **Original implication for Aura (pre-2026-05-24):** the handle-only choice was materially exposed to this failure mode.
- **Updated implication (post-2026-05-24 passkey decision):** passkey-primary auth is **phishing-resistant by design** (origin-bound cryptographic credentials cannot be replayed). The ATO failure mode shifts from "handle-only is vulnerable" to "passkey fallback cohort on SMS OTP retains the conventional ATO surface for that subset only." The architectural mitigation effectively eliminates the dominant failure mode for the ~85–95% of users on the passkey path; the remaining residual is bounded and tracked as **R-AUTH-V2** in the architecture bet.
- [Security Boulevard ATO Defense Playbook 2026](https://securityboulevard.com/2026/05/account-takeover-protection-for-online-retailers-a-2026-defense-playbook/); [Synack — Account Takeovers](https://www.synack.com/exploits-explained/account-takeovers-believe-the-unbelievable/); [Vaadata ATO techniques](https://www.vaadata.com/blog/account-takeover-techniques-and-security-best-practices/); [Descope ATO learn](https://www.descope.com/learn/post/account-takeover)

### B. pgvector recall degradation when HNSW index spills out of memory
- Production reports: "biggest factor in pgvector performance is keeping HNSW index in memory; index eviction by concurrent ops kills P95."
- At 200M vectors, RAM budget exceeds 850GB — index size grows roughly 3× base vector size.
- **Implication for Aura:** Aura's memory-recall fitness function (P95 ≤1.5s) holds only while index fits memory. At sustained >10M vectors (≈100K WAR × 100 memories each), we monitor index size vs. instance RAM; trigger upsizing or compaction before eviction starts. Logged as **R-MEMORY**.
- [Postgres Vector Search — Benchmarks, Costs & Reality (Ronak Rathore)](https://medium.com/@DataCraft-Innovations/postgres-vector-search-with-pgvector-benchmarks-costs-and-reality-check-f839a4d2b66f); [Optimizing Vector Search at Scale (Dikhyant Krishna Dalai)](https://medium.com/@dikhyantkrishnadalai/optimizing-vector-search-at-scale-lessons-from-pgvector-supabase-performance-tuning-ce4ada4ba2ed)

### C. PNPM-in-Expo-monorepo CI failures (Wereform case study)
- Expo's EAS Build assumed Yarn historically; PNPM workspace layout broke CI builds that worked in dev.
- Solution: publish workspace packages as actual npm packages for EAS Build context, while keeping workspace links in development.
- **Implication for Aura:** known pre-existing footgun. Mitigation is documented and applied at scaffold time. Logged in architecture-research findings, not as a project risk (it's a process detail).
- [Wereform — RN Monorepo with Turbo+PNPM+Expo](https://medium.com/wereform/how-i-finally-got-a-react-native-monorepo-working-with-turbo-pnpm-and-an-expo-shell-after-c8afd85522ea)

### D. AI Gateway provider outages — empirical fallback rate
- Vercel's published metric: **3.5% of requests on AI Gateway complete only after fallback** — meaning that fraction of requests would have failed if routed direct to a single provider.
- **Implication for Aura:** going single-provider exposes ~3.5% of conversation turns to provider-outage failure in steady-state. AI Gateway's routing absorbs this.
- [Vercel AI Gateway production index](https://vercel.com/blog/ai-gateway-production-index)

---

## 5. Pillar fit (per-candidate)

Where each candidate aligns or fights each of the 6 Well-Architected pillars. Detail used in the per-row pillar evaluations in `architecture.md` § Stack.

### A. TypeScript / Node.js 24 (backend language)
- **Reliability:** good — Node 24 LTS, long-term support window covers measurement horizon.
- **Security:** acceptable — mainstream language with active ecosystem patching; npm audit footprint is the operational cost.
- **Performance efficiency:** acceptable — single-threaded model is acceptable for I/O-bound API + LLM-proxy workload; not chosen for CPU-bound numerics.
- **Cost optimization:** good — Vercel Functions billing is per-active-CPU-second, well-suited to async-heavy Node.
- **Operational excellence:** good — same language across mobile/web/packages reduces context-switching.
- **Sustainability:** acceptable — Fluid Compute reuses instances, reducing cold-start carbon overhead.

### B. Next.js 16 App Router (backend framework)
- **Reliability:** good — mature, large community, large surface for known issues.
- **Security:** good — security advisories well-published, framework hardens common attack vectors.
- **Performance efficiency:** good — Cache Components / PPR / Edge runtime options. Vercel Mumbai region available.
- **Cost optimization:** good — Fluid Compute pricing model matches our workload; default 300s timeout removes one common cost-spike trap.
- **Operational excellence:** good — Vercel preview deployments per PR; observability built-in; one-command deploy.
- **Sustainability:** acceptable — instance reuse via Fluid Compute. Region-pinned to Mumbai (no cross-continent traffic).

### C. Expo / React Native (mobile framework)
- **Reliability:** good — EAS Update enables push-to-fix without app-store review.
- **Security:** acceptable — secure storage primitives available; native crypto via OS keychain.
- **Performance efficiency:** acceptable — RN performance has matured significantly; voice/audio path is well-supported by Expo modules.
- **Cost optimization:** good — single codebase ships both iOS and Android.
- **Operational excellence:** good — EAS Build + Update + Submit handle the build/publish pipeline.
- **Sustainability:** acceptable — single-codebase means single CI footprint.

### D. Supabase (database + storage)
- **Reliability:** good — managed Postgres with point-in-time recovery; multi-AZ standard.
- **Security:** good — Row-Level Security; encryption at rest; auth-API even if not used; SOC 2.
- **Performance efficiency:** good — pgvector benchmarks (above) clear our headroom by >10×.
- **Cost optimization:** good — single bill for relational + vector + storage; no second-DB sync overhead.
- **Operational excellence:** good — migrations via SQL files; Supabase CLI in CI.
- **Sustainability:** acceptable — region-pinned; managed = vendor handles efficiency.

### E. Vercel AI Gateway + Claude + OpenAI
- **Reliability:** good — Gateway uptime exceeds any single upstream; ~3.5% of requests rescued via fallback.
- **Security:** good — keys managed by Vercel env vars; per-call audit trail.
- **Performance efficiency:** acceptable — routing adds tens of ms over direct calls; absorbed by LLM-call latency dominant factor.
- **Cost optimization:** good — zero platform markup; price arbitrage between providers.
- **Operational excellence:** good — single dashboard; provider mix adjusted without code changes.
- **Sustainability:** acceptable — Gateway routing centralised; no duplicate inference attempts on the hot path.

### F. Bhashini / AI4Bharat (speech)
- **Reliability:** acceptable — state-backed infra; SLA published but new; production load behaviour evolving.
- **Security:** good — open-source models available for self-host fallback if needed.
- **Performance efficiency:** acceptable — TTS MOS 3.6–3.9; acceptable for conversational counsel, not paid-content tier.
- **Cost optimization:** good — free / heavily-discounted vs commercial alternatives (per-call cost ~10–30× lower than ElevenLabs).
- **Operational excellence:** acceptable — newer vendor; less mature ops tooling; need to monitor more closely.
- **Sustainability:** good — state infrastructure is by definition long-horizon.

### G. tRPC (contracts)
- **Reliability:** good — production case studies at 2.4M req/day, 99.97% uptime.
- **Security:** good — type-checked inputs reduce class of injection / type-confusion bugs.
- **Performance efficiency:** good — minimal overhead vs REST.
- **Cost optimization:** good — no codegen step, no schema-registry to operate.
- **Operational excellence:** good — single-team / single-repo / single-language is the documented sweet spot.
- **Sustainability:** acceptable — no impact.

### H. Passkey-primary auth (WebAuthn synced) + biometric + display handle + SMS OTP fallback — SUPERSEDED handle-only on 2026-05-24
- **Reliability:** good — synced passkeys recover via iCloud Keychain / Google Password Manager; OTP fallback covers cloud-sync-unavailable users; no third-party SPOF.
- **Security:** **good** — cryptographic, origin-bound, phishing-resistant by W3C-standard design. Biometric-gated unlock. Industry ATO baseline (76% YoY in 2024) is structurally mitigated. India passkey-readiness: Android ~97%, iOS ~99% as of 2026.
- **Performance efficiency:** good — WebAuthn challenge/response ~tens of ms; lower friction than typing a handle.
- **Cost optimization:** good — WebAuthn is a free open standard. OTP fallback fires only on rare path (~5–15%); MSG91 OTP ≈ ₹0.15/call. No per-MAU SaaS bill.
- **Operational excellence:** good — standard ceremony; less takeover support load; self-service recovery via platform keychains.
- **Sustainability:** good — marginal SMS OTP traffic only on fallback; cryptographic ops on-device.

**Previous handle-only scoring (preserved for traceability):**
- Reliability: good — fewer dependencies than OTP-based.
- Security: **poor** — anyone with the handle has access; no recovery; ATO surface non-trivial.
- Performance efficiency: good — single DB lookup.
- Cost optimization: good — no per-MAU SaaS bill.
- Operational excellence: acceptable — more support load on lockouts / takeovers expected.
- Sustainability: good — no third-party traffic.

### I. GitHub Actions + Vercel preview deployments (CI/CD)
- All 6 pillars: good or acceptable; mainstream choice, free for small repos, no exotic risk.
- [Vercel deployments docs](https://vercel.com/docs/deployments)

### J. Sentry (observability) — already in `compass/config.yaml`
- Mature, mainstream, ecosystem leader. All 6 pillars: good or acceptable.

### K. Vercel env vars + EAS Secrets (secrets)
- Standard practice in Vercel + EAS stacks; rotation tooling adequate; no IaC overhead.

### L. IaC deferred
- Architect's judgment per role anti-patterns ("designing for scale you'll never see"). All 6 pillars: marked "n/a at current stage; revisit when ops scope > 1 hr/week."

---

## 6. Reversibility honesty (evidence-backed)

Lock-in for each major choice with migration cost evidence.

| Choice | Reversibility | Evidence |
|--------|---------------|----------|
| TypeScript / Node | hard | Language migration = full rewrite. Industry baseline: rewrites measured in months for systems our size. |
| Turborepo + pnpm monorepo | medium | Monorepo→polyrepo is a mechanical split (tooling exists); polyrepo→monorepo is harder. |
| Next.js 16 | medium | Next→Remix/SvelteKit migrations are documented multi-week efforts for medium codebases. Route handlers are framework-coupled. |
| Expo / RN | medium | Expo eject path → bare React Native is documented and supported; further migration RN→native is a rewrite. |
| **Supabase** | **medium** | Postgres is portable to any Postgres host (mechanical). Supabase client libs + auth-API create coupling — migration cost grows with usage of those APIs. Since we use handle-only (no Supabase Auth), coupling is mostly to client lib (replaceable). [Supabase self-host transfer docs](https://supabase.com/docs/guides/troubleshooting/transferring-from-cloud-to-self-host-in-supabase-2oWNvW); [Supabase alternatives comparison](https://uibakery.io/blog/supabase-alternatives) |
| pgvector | hard | At small volumes, migration to Pinecone/Weaviate is a re-embed + bulk-upload — days. At 10M+ vectors, re-embedding cost (in $ + time) becomes meaningful. |
| AI Gateway | easy | Speaks provider-native APIs at the boundary. `packages/ai/gateway.ts` swap is days. [Vercel AI Gateway GA](https://vercel.com/blog/ai-gateway-is-now-generally-available) |
| Anthropic + OpenAI | easy | Both speak similar message-API shapes; prompts may need re-tuning but no fundamental relock. |
| Bhashini / AI4Bharat | easy | Apache 2.0 OSS models — can self-host if API disappears. Sarvam is a credible fallback. |
| Passkey-primary + OTP fallback (SUPERSEDED handle-only on 2026-05-24) | medium | WebAuthn is W3C standard — portable to any compliant relying-party library. Cloud-keychain sync (iCloud / Google Password Manager) handles cross-device recovery. Migration off passkeys back to OTP-primary later would be a mechanical relying-party change but would worsen the Security pillar score. |
| Vercel hosting | medium | Next.js can be self-hosted on any Node host or Cloudflare Pages / Netlify. Some Vercel-specific features (Functions, Edge Config, Image Optimization) need replacement. |
| Region pin to India | one-way for already-stored data | DPDPA + brand promise: cannot move existing users' memories without consent. |
| GitHub Actions | medium | Migration to GitLab CI / CircleCI is mechanical; mostly YAML rewrites. |

---

## Sources (full list)

Prior art:
- [Wysa Clinical Evidence](https://www.wysa.com/clinical-evidence)
- [Replika AI Statistics & Trends](https://nikolaroza.com/replika-ai-statistics-facts-trends/)
- [ElectroIQ AI Companion Stats 2025](https://electroiq.com/stats/ai-companions-statistics/)
- [Tech @ EF — Multi-Tenancy with Turborepo + Expo](https://www.eftech.com/blog/posts/multi-tenancy-in-react-native-with-expo-turborepo)
- [InfoQ — Building Production-Ready tRPC APIs](https://www.infoq.com/articles/building-trpc-api-typescript/)

Benchmarks:
- [Supabase pgvector 0.4.0 performance](https://supabase.com/blog/pgvector-performance)
- [Postgres Vector Search with pgvector (Ronak Rathore)](https://medium.com/@DataCraft-Innovations/postgres-vector-search-with-pgvector-benchmarks-costs-and-reality-check-f839a4d2b66f)
- [Optimizing Vector Search at Scale (Dikhyant Krishna Dalai)](https://medium.com/@dikhyantkrishnadalai/optimizing-vector-search-at-scale-lessons-from-pgvector-supabase-performance-tuning-ce4ada4ba2ed)
- [pgvector vs Pinecone cost/perf (Supabase)](https://supabase.com/blog/pgvector-vs-pinecone)
- [Vercel AI Gateway production index](https://vercel.com/blog/ai-gateway-production-index)
- [Vercel AI Gateway uptime docs](https://vercel.com/docs/ai-gateway/models-and-providers/uptime)
- [Vercel Mumbai (bom1) region pricing](https://vercel.com/docs/pricing/regional-pricing/bom1)
- [Vercel regions docs](https://vercel.com/docs/regions)
- [Vercel status](https://www.vercel-status.com/)
- [AI4Bharat IIT Madras](https://ai4bharat.iitm.ac.in/)
- [Bhashini official](https://www.bhashini.ai/)
- [Towards TTS for Next Billion Users (arxiv)](https://arxiv.org/pdf/2211.09536)

Vendor health:
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025)
- [Enstacked — SO Survey Insights 2025](https://enstacked.com/stack-overflow-developer-survey-insights/)
- [Supabase Docs — Transferring to Self-Host](https://supabase.com/docs/guides/troubleshooting/transferring-from-cloud-to-self-host-in-supabase-2oWNvW)
- [Supabase Alternatives 2026 (UI Bakery)](https://uibakery.io/blog/supabase-alternatives)
- [Expo monorepos docs](https://docs.expo.dev/guides/monorepos/)
- [byCedric Expo monorepo example](https://github.com/byCedric/expo-monorepo-example)
- [Vercel AI Gateway](https://vercel.com/ai-gateway)
- [Vercel AI Gateway GA announcement](https://vercel.com/blog/ai-gateway-is-now-generally-available)
- [VoicERA announcement](https://edunovations.com/currentaffairs/national/voicera-ai-stack-on-bhashini/)

Failure modes:
- [Security Boulevard ATO Defense Playbook 2026](https://securityboulevard.com/2026/05/account-takeover-protection-for-online-retailers-a-2026-defense-playbook/)
- [Synack — Account Takeovers](https://www.synack.com/exploits-explained/account-takeovers-believe-the-unbelievable/)
- [Vaadata ATO techniques](https://www.vaadata.com/blog/account-takeover-techniques-and-security-best-practices/)
- [Descope ATO learn](https://www.descope.com/learn/post/account-takeover)
- [Wereform — RN Monorepo with Turbo+PNPM+Expo footguns](https://medium.com/wereform/how-i-finally-got-a-react-native-monorepo-working-with-turbo-pnpm-and-an-expo-shell-after-c8afd85522ea)

## DRI Log

### Decisions

- [2026-05-23] [Enterprise/Solution Architect] Split architecture research into a standalone `architecture-research.md` rather than embedding inline.
  - **Rationale (required):** Per role file § "Architecture research", standalone is preferred when findings are substantial. Keeps `architecture.md` scannable for HITL review.
  - **Area (required, tag):** process / documentation.
  - **Alternatives considered (required):** embed inline (rejected — would make architecture.md ~3× longer with research interleaved with decisions).
  - **Reversibility:** easy.

### Risks

- [2026-05-23] [Enterprise/Solution Architect] Bhashini production-load WER/MOS benchmarks for conversational (not sentence-level) workloads are thin in public sources. Vendor-published numbers (AI4Bharat MOS 3.6–3.9) are sentence-level.
  - **Likelihood (required):** medium.
  - **Impact (required):** medium (could surface as voice-UX quality issue at first 100s of real-user voice turns).
  - **Mitigation (required):** Pre-MVP domain eval (record 20 real reflection-style conversations per top-6 language, score MOS in-house). If a language fails our internal MOS bar in conversational context, ship without that language. Logged as R-SPEECH in `architecture.md`.
  - **Area (required, tag):** AI / UX.

### Issues
_None — research is complete to the level required for Phase A approval._
