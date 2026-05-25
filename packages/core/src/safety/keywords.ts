/**
 * Crisis keyword seed list — used by the same-turn classifier in `packages/ai/safety.ts`.
 *
 * NOTE: This is a SEED list, not the production classifier. The real classifier
 * (LLM-based, multilingual, contextual) ships under a feature bet with a mandatory
 * red-team test suite per architecture § Cross-cutting standards → Testing.
 *
 * Per product § Guardrails (Safety): ≥99% of crisis-flagged conversations get same-session
 * escalation. Classifier runs synchronously in the request path on every turn.
 */

export const crisisKeywords = {
  en: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'hurt myself',
    'no point living',
  ],
  hi: [
    // Romanised Hindi seed terms — Devanagari additions in v1 release feature bet
    'khud ko maar',
    'jeene ka koi matlab nahi',
    'apne aap ko khatam',
  ],
} as const;

export const teleManasHelpline = '14416'; // India national mental health helpline

export type CrisisLanguage = keyof typeof crisisKeywords;
