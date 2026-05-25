/**
 * Supabase server-side client — the ONLY place that talks to Supabase.
 * Per architecture § Boundaries: `apps/*` never import @supabase/supabase-js directly.
 *
 * Uses service role on the server; per-request user scoping is set via
 * `SET LOCAL request.user_id = $userId` so RLS policies can reference it
 * (see migration 0001 — RLS enabled; per-policy scoping is a feature-bet detail).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function serverClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Scope subsequent queries on a Postgres connection to a specific user. */
export async function setRequestUser(client: SupabaseClient, userId: string): Promise<void> {
  await client.rpc('set_request_user', { user_id: userId });
}
