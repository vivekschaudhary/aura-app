/**
 * users table query helpers — the ONLY place `apps/*` should reach for user
 * reads/writes (architecture § Boundaries forbids direct supabase-js imports
 * outside this package).
 *
 * Handle is a `citext` column so uniqueness is case-insensitive at the DB
 * layer. The mobile client also normalizes (trim + lowercase) before send to
 * keep the visible state honest.
 */

import { createHash } from 'node:crypto';
import type { Language, UUID } from '@aura/core';
import { serverClient } from './client';

export interface InsertUserInput {
  handle: string;
  primaryLanguage: Language;
}

export interface UserRow {
  id: UUID;
  handle: string;
  primaryLanguage: Language;
}

/**
 * Returns `false` if the handle is already taken (citext-collision), `true`
 * otherwise. Soft-deleted users still hold their handle for the 30-day
 * restore window per architecture § Foundational Data Model § Delete posture.
 */
export async function checkHandleAvailability(handle: string): Promise<boolean> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('handle', handle)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data === null;
}

export async function insertUser(input: InsertUserInput): Promise<UserRow> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('users')
    .insert({ handle: input.handle, primary_language: input.primaryLanguage })
    .select('id, handle, primary_language')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    handle: data.handle,
    primaryLanguage: data.primary_language as Language,
  };
}

export async function findUserById(id: UUID): Promise<UserRow | null> {
  const supabase = serverClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, handle, primary_language')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    handle: data.handle,
    primaryLanguage: data.primary_language as Language,
  };
}

/**
 * SHA-256 of the handle, hex-encoded — the architecture's logging standard
 * for handle references (`Log handle hashes, not handles`). Used by audit_log
 * metadata + funnel events.
 */
export function hashHandle(handle: string): string {
  return createHash('sha256').update(handle).digest('hex');
}
