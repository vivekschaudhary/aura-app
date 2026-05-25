/**
 * Memory layer — the moat. Persistent, semantically-indexed life story per user.
 * Backed by Postgres + pgvector (HNSW) in Supabase per § Foundational Data Model.
 *
 * P95 recall target: ≤ 1.5s (Performance fitness function).
 * Cost target: ~$0.0001 / memory at OpenAI embedding prices.
 */

import type { Memory, Result, UUID } from '@aura/core';

export interface MemoryWriteInput {
  userId: UUID;
  content: string;
  topic: string;
}

export interface MemoryRecallInput {
  userId: UUID;
  query: string;
  limit?: number; // default 5
}

/** Persist a memory + embedding. Stub — feature bet wires Supabase + embedding model. */
export async function writeMemory(_input: MemoryWriteInput): Promise<Result<Memory>> {
  return {
    ok: false,
    error: new Error('TODO: wire Supabase + embedding model — feature bet'),
  };
}

/** Semantic recall against the user's memory store. */
export async function recall(_input: MemoryRecallInput): Promise<Result<Memory[]>> {
  return {
    ok: false,
    error: new Error('TODO: pgvector ANN query via Supabase — feature bet'),
  };
}
