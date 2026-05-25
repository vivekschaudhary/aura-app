/**
 * Short-lived, HMAC-signed challenge tokens.
 *
 * WebAuthn enrollment is a two-call ceremony (begin → device prompt → finish).
 * Between calls the server needs to remember the challenge it issued so it can
 * verify the device's signed response. There's no session store yet (no
 * Redis / Vercel KV) — and standing one up just for this is overkill at PR-2
 * scale.
 *
 * Instead we sign a compact `{userId, challenge, exp}` token with HMAC-SHA256
 * and return it to the client opaque. The client opaque-passes it back to
 * `finishEnrollment`, which verifies signature + expiry. Same approach scales
 * to passkey assertion (Story 2) and OTP (Story 2 OPS-001-blocked).
 *
 * Five-minute TTL — WebAuthn ceremonies are interactive but very short;
 * anything beyond 5 min is almost certainly a replay attempt.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface ChallengePayload {
  userId: string;
  /** base64url-encoded WebAuthn challenge bytes — same value the device signs. */
  challenge: string;
  /** Unix epoch ms — token is rejected if Date.now() > exp. */
  exp: number;
}

export interface SignOptions {
  secret: string;
  ttlMs?: number;
}

export interface VerifyOptions {
  secret: string;
  now?: number;
}

export type VerifyResult =
  | { ok: true; payload: ChallengePayload }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' };

function base64urlEncode(buf: Buffer | Uint8Array): string {
  return Buffer.from(buf).toString('base64url');
}

function base64urlDecode(str: string): Buffer {
  return Buffer.from(str, 'base64url');
}

export function signChallengeToken(
  payload: Omit<ChallengePayload, 'exp'>,
  options: SignOptions,
): string {
  const ttl = options.ttlMs ?? DEFAULT_TTL_MS;
  const full: ChallengePayload = { ...payload, exp: Date.now() + ttl };
  const body = base64urlEncode(Buffer.from(JSON.stringify(full), 'utf8'));
  const sig = base64urlEncode(createHmac('sha256', options.secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyChallengeToken(token: string, options: VerifyOptions): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const body = parts[0]!;
  const sigStr = parts[1]!;

  const expected = createHmac('sha256', options.secret).update(body).digest();
  const provided = base64urlDecode(sigStr);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { ok: false, reason: 'bad_signature' };
  }

  let payload: ChallengePayload;
  try {
    payload = JSON.parse(base64urlDecode(body).toString('utf8')) as ChallengePayload;
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const now = options.now ?? Date.now();
  if (typeof payload.exp !== 'number' || now > payload.exp) {
    return { ok: false, reason: 'expired' };
  }
  if (typeof payload.userId !== 'string' || typeof payload.challenge !== 'string') {
    return { ok: false, reason: 'malformed' };
  }

  return { ok: true, payload };
}

/**
 * Session token issued by finishEnrollment. Same HMAC shape, longer TTL.
 * Client persists it in expo-secure-store; future authenticated procedures
 * verify it on the way in (lands when Story 2 wires returning-user assertion).
 */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionPayload {
  userId: string;
  exp: number;
}

export function signSessionToken(userId: string, secret: string, ttlMs = SESSION_TTL_MS): string {
  const payload: SessionPayload = { userId, exp: Date.now() + ttlMs };
  const body = base64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = base64urlEncode(createHmac('sha256', secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
  now: number = Date.now(),
):
  | { ok: true; payload: SessionPayload }
  | { ok: false; reason: 'malformed' | 'bad_signature' | 'expired' } {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const body = parts[0]!;
  const sigStr = parts[1]!;
  const expected = createHmac('sha256', secret).update(body).digest();
  const provided = base64urlDecode(sigStr);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return { ok: false, reason: 'bad_signature' };
  }
  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64urlDecode(body).toString('utf8')) as SessionPayload;
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (typeof payload.exp !== 'number' || now > payload.exp) {
    return { ok: false, reason: 'expired' };
  }
  if (typeof payload.userId !== 'string') {
    return { ok: false, reason: 'malformed' };
  }
  return { ok: true, payload };
}
