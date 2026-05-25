/**
 * passkey_credentials table query helpers.
 *
 * `credential_id` (added in migration 0007) is the WebAuthn natural identifier
 * — what the device signs with and what we use to look up a credential during
 * assertion (Story 2) or exclude from re-enrollment (PR 2 begin ceremony).
 * The bytea column is base64url-encoded on the way in / out so the public API
 * matches @simplewebauthn's wire shape.
 */

import type { UUID } from '@aura/core';
import { serverClient } from './client.js';

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

function base64urlToBytes(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, 'base64url'));
}

function bytesToBase64url(b: Uint8Array): string {
  return Buffer.from(b).toString('base64url');
}

export async function insertPasskeyCredential(
  input: InsertPasskeyCredentialInput,
): Promise<PasskeyCredentialRow> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('passkey_credentials')
    .insert({
      user_id: input.userId,
      credential_id: base64urlToBytes(input.credentialId),
      public_key: input.publicKey,
      counter: input.counter,
      aaguid: input.aaguid,
    })
    .select('id, user_id, credential_id, counter, aaguid')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    userId: data.user_id,
    credentialId: bytesToBase64url(data.credential_id),
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
  return (data ?? []).map((row) => bytesToBase64url(row.credential_id));
}
