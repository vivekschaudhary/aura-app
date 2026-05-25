/**
 * tRPC request context.
 *
 * Built per-request by `createContext` (called from the HTTP route handler).
 * Carries config + per-request user identity (null in PR 2 since no procedure
 * is authenticated yet; the field exists so future procedures wire through
 * the existing `requireAuth` middleware unchanged).
 */

export interface RuntimeConfig {
  /** WebAuthn Relying Party identity (e.g. 'aura.app'). */
  rpId: string;
  /** Human-readable RP name shown in OS biometric prompts. */
  rpName: string;
  /** Origin the client connected from (used by @simplewebauthn for verification). */
  origin: string;
  /** HMAC secret for signing the challenge token returned by beginEnrollment. */
  webauthnSigningSecret: string;
  /** HMAC secret for signing the session token returned by finishEnrollment. */
  sessionSigningSecret: string;
}

export interface Context {
  config: RuntimeConfig;
  userId: string | null;
}

export interface CreateContextOpts {
  headers: Headers;
  /** Optional override (tests pass an explicit config; route handler reads from env). */
  config?: RuntimeConfig;
}

function loadConfigFromEnv(): RuntimeConfig {
  const env = (key: string): string => {
    const v = process.env[key];
    if (!v) throw new Error(`Missing required env var: ${key}`);
    return v;
  };
  return {
    rpId: env('WEBAUTHN_RP_ID'),
    rpName: process.env.WEBAUTHN_RP_NAME ?? 'Aura',
    origin: env('WEBAUTHN_ORIGIN'),
    webauthnSigningSecret: env('WEBAUTHN_SIGNING_SECRET'),
    sessionSigningSecret: env('SESSION_SIGNING_SECRET'),
  };
}

export function createContext(opts: CreateContextOpts): Context {
  return {
    config: opts.config ?? loadConfigFromEnv(),
    userId: null,
  };
}
