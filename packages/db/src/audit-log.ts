/**
 * audit_log query helpers.
 *
 * Per migration 0001 the table is IMMUTABLE — no updates, no deletes
 * (triggers enforce this once we lay them down in OPS-001 territory).
 * Only inserts allowed here. Metadata must NEVER contain conversation
 * content or PII beyond stable identifiers (handle hash, not handle, per
 * architecture § Cross-cutting standards § Logging).
 */

import type { UUID } from '@aura/core';
import { serverClient } from './client.js';

export interface InsertAuditLogInput {
  eventType: string;
  /** Nullable for system-initiated events (key rotation etc). */
  actorUserId: UUID | null;
  entityType: string;
  entityId: UUID;
  metadata?: Record<string, unknown>;
}

export async function insertAuditLog(input: InsertAuditLogInput): Promise<void> {
  const supabase = serverClient();
  const { error } = await supabase.from('audit_log').insert({
    event_type: input.eventType,
    actor_user_id: input.actorUserId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata ?? {},
  });
  if (error) throw error;
}
