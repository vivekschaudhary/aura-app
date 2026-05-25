/**
 * Shared domain types mirroring `docs/foundation/architecture.md` § Foundational Data Model.
 * Every entity here traces back to a line in `docs/foundation/product.md` v2.
 */

export type UUID = string; // UUID v7 — see § Foundational Data Model § Identity strategy

export type Language = 'en' | 'hi'; // v1 launch set; additive enum per migration 0006

export interface User {
  id: UUID;
  handle: string;
  primaryLanguage: Language;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PasskeyCredential {
  id: UUID;
  userId: UUID;
  publicKey: Uint8Array;
  counter: bigint;
  aaguid: string;
  createdAt: Date;
  lastUsedAt: Date;
}

/**
 * A persistent topical thread. Users have many in parallel.
 * Title is auto-summarised after ~3 turns, user-editable.
 * "Session" is a computed concept (turn-timestamp clustering), not stored.
 */
export interface Conversation {
  id: UUID;
  userId: UUID;
  title: string;
  language: Language;
  startedAt: Date;
  lastActiveAt: Date;
  endedAt: Date | null;
  deletedAt: Date | null;
}

export type TurnRole = 'user' | 'assistant';

export interface Turn {
  id: UUID;
  conversationId: UUID;
  role: TurnRole;
  content: string; // PII — encrypted at rest, never logged
  model: string | null; // null for user turns
  tokensIn: number;
  tokensOut: number;
  costInr: number;
  latencyMs: number;
  createdAt: Date;
}

export interface Memory {
  id: UUID;
  userId: UUID;
  content: string; // PII — encrypted at rest, never logged
  embedding: number[]; // 1536-dim
  topic: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ClarityMoment {
  id: UUID;
  conversationId: UUID;
  userId: UUID;
  note: string; // PII
  createdAt: Date;
}

export interface CrisisFlag {
  id: UUID;
  conversationId: UUID;
  classifierVersion: string;
  indicatorType: string;
  confidence: number;
  detectedAt: Date; // immutable
}

export interface EscalationEvent {
  id: UUID;
  crisisFlagId: UUID;
  action: string; // e.g. 'tele_manas_card', 'helpline_call'
  userAcknowledged: boolean;
  createdAt: Date; // immutable
}

export type RatingType = 'clarity' | 'nps';

export interface Rating {
  id: UUID;
  userId: UUID;
  conversationId: UUID | null; // null for NPS submissions
  type: RatingType;
  score: number;
  comment: string | null; // PII (nullable)
  createdAt: Date;
}

export interface AuditLog {
  id: UUID;
  eventType: string;
  actorUserId: UUID | null;
  entityType: string;
  entityId: UUID;
  metadata: Record<string, unknown>;
  occurredAt: Date; // immutable
}

/** Result<T, E> pattern used across module boundaries (no throws). */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
