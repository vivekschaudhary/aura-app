/**
 * Vercel AI Gateway client — the ONLY place that talks to LLM providers.
 * Routes per-turn between Anthropic Claude (Sonnet / Haiku) and OpenAI (GPT-4o / 4o-mini)
 * by criticality. Per-call cost telemetry rolls up to the cost/WAR dashboard.
 *
 * Per architecture § Stack → AI orchestration, § Cross-cutting standards → Prompts.
 */

import type { Result } from '@aura/core';

export type TurnCriticality = 'routine' | 'high-stakes';

/**
 * AI Gateway model string in `provider/model` format (AI SDK v6 convention).
 * These are NOT direct provider SDK references — they are routing tokens consumed by
 * the Vercel AI Gateway, which handles auth (OIDC), provider failover, and cost telemetry.
 * No `@ai-sdk/anthropic` / `@ai-sdk/openai` packages are installed; only `ai` v6 + Gateway.
 *
 * Routine turns → small/cheap model. High-stakes (decisions, crisis-adjacent) → large.
 */
export type GatewayModel =
  | 'anthropic/claude-sonnet-4-6'
  | 'anthropic/claude-haiku-4-5'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini';

export function routeModel(criticality: TurnCriticality): GatewayModel {
  return criticality === 'high-stakes'
    ? 'anthropic/claude-sonnet-4-6'
    : 'anthropic/claude-haiku-4-5';
}

export interface GenerateInput {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  criticality: TurnCriticality;
}

export interface GenerateResult {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costInr: number;
  latencyMs: number;
}

/** Generate an assistant turn via Vercel AI Gateway. Stub — feature bet wires this up. */
export async function generate(_input: GenerateInput): Promise<Result<GenerateResult>> {
  // Wire-up note: use `ai` v6 `generateText`/`streamText` with the model string
  // from routeModel(criticality). AI Gateway resolves the `provider/model` string
  // and handles fallback. Stream user-facing responses via toUIMessageStreamResponse.
  return {
    ok: false,
    error: new Error('TODO: wire AI SDK v6 generateText/streamText via AI Gateway — feature bet'),
  };
}
