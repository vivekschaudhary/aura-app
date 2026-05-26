/**
 * passkey_credentials table query helpers.
 *
 * `credential_id` (added in migration 0007) is the WebAuthn natural identifier
 * — what the device signs with and what we use to look up a credential during
 * assertion (Story 2) or exclude from re-enrollment (PR 2 begin ceremony).
 *
 * Bytea encoding (per Codex P1 review of PR #2 commit 3092843): Supabase
 * PostgREST serializes `bytea` columns as `\x`-prefixed hex strings, not raw
 * bytes. Writing a `Uint8Array` via supabase-js JSON-encodes it as
 * `{"0":1,"1":2,...}` which Postgres rejects; reading a `bytea` returns the
 * literal text `\x68656c6c6f`. We convert both directions at the boundary so
 * the public API stays in base64url (matching @simplewebauthn's wire shape).
 */

import type { UUID } from '@aura/core';
import { serverClient } from './client';

export interface InsertPasskeyCredentialInput {
  userId: UUID;
  /** base64url credential id from the authenticator. */
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  aaguid: string;
}

export interface PasskeyCredentialRow {
  id: UUID;
  userId: UUID;
  credentialId: string;
  counter: number;
  aaguid: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// bytea encoding helpers — exported for tests.
// ──────────────────────────────────────────────────────────────────────────────

/** Encode bytes as the `\x`-prefixed hex literal Postgres expects on insert. */
export function bytesToPgHex(b: Uint8Array): string {
  return '\\x' + Buffer.from(b).toString('hex');
}

/**
 * Decode a Supabase/PostgREST bytea response back to bytes.
 *
 * PostgREST returns bytea as either:
 *   - `'\x68656c6c6f'` (hex_output = 'hex', the modern default), or
 *   - `'aGVsbG8='`     (rare — if the column has been base64-cast)
 *
 * We accept both. The `\x` prefix is the discriminator.
 */
export function pgHexToBytes(value: string): Uint8Array {
  if (value.startsWith('\\x')) {
    return new Uint8Array(Buffer.from(value.slice(2), 'hex'));
  }
  // Fallback: treat as base64 (defensive; shouldn't happen under default config).
  return new Uint8Array(Buffer.from(value, 'base64'));
}

function base64urlToBytes(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, 'base64url'));
}

function bytesToBase64url(b: Uint8Array): string {
  return Buffer.from(b).toString('base64url');
}

// ──────────────────────────────────────────────────────────────────────────────
// queries
// ──────────────────────────────────────────────────────────────────────────────

export async function insertPasskeyCredential(
  input: InsertPasskeyCredentialInput,
): Promise<PasskeyCredentialRow> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('passkey_credentials')
    .insert({
      user_id: input.userId,
      credential_id: bytesToPgHex(base64urlToBytes(input.credentialId)),
      public_key: bytesToPgHex(input.publicKey),
      counter: input.counter,
      aaguid: input.aaguid,
    })
    .select('id, user_id, credential_id, counter, aaguid')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    credentialId: bytesToBase64url(pgHexToBytes(data.credential_id)),
    counter: data.counter,
    aaguid: data.aaguid,
  };
}

/**
 * Lists already-enrolled credential ids for a user. Passed to
 * `@aura/auth.beginEnrollment` as `excludeCredentialIds` so the same
 * authenticator can't be enrolled twice (which would leave the user with
 * two database rows that resolve to the same physical key).
 */
export async function listCredentialIdsForUser(userId: UUID): Promise<string[]> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('passkey_credentials')
    .select('credential_id')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => bytesToBase64url(pgHexToBytes(row.credential_id)));
}
