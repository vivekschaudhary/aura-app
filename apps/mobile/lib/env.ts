/**
 * Mobile-side env access. Only `EXPO_PUBLIC_*` env vars are inlined at build
 * time by Expo — anything secret stays server-side.
 *
 * Defaults to localhost so `expo start` works against a `pnpm dev` web app
 * without configuration. TestFlight / EAS preview builds set the var via
 * EAS Secrets (per OPS-001).
 */

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_API_BASE_URL;
}
