/**
 * Crisis detection + Tele-MANAS escalation.
 * Runs SYNCHRONOUSLY in the request path on every conversation turn per architecture
 * § Stack → Crisis detection. Same-session escalation is non-negotiable
 * (product § Guardrails → Safety: ≥99% same-session).
 */

import type { CrisisFlag, EscalationEvent, Result, UUID } from '@aura/core';
import { crisisKeywords, teleManasHelpline, type CrisisLanguage } from '@aura/core/safety';

export interface CrisisDetectInput {
  conversationId: UUID;
  userTurnContent: string;
  language: CrisisLanguage;
}

export interface CrisisDetectResult {
  flagged: boolean;
  flag?: CrisisFlag;
  escalation?: EscalationEvent;
}

/**
 * Stub classifier — keyword match against seed list. The production classifier
 * (LLM-based, multilingual, contextual) ships under a feature bet with a mandatory
 * red-team test suite.
 */
export async function detect(input: CrisisDetectInput): Promise<Result<CrisisDetectResult>> {
  const keywords = crisisKeywords[input.language] ?? [];
  const lowered = input.userTurnContent.toLowerCase();
  const hit = keywords.some((kw) => lowered.includes(kw));

  return {
    ok: true,
    value: { flagged: hit },
  };
}

export { teleManasHelpline };
