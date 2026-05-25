/**
 * WebAuthn (passkey) ceremony — primary identity path per architecture
 * § Stack → Auth / identity. The ONLY place server-side WebAuthn runs.
 *
 * Synced passkeys gated by device biometric. Private key never leaves device.
 * Recovery via iCloud Keychain / Google Password Manager + SMS OTP fallback (./otp.ts).
 */

import type { PasskeyCredential, Result, UUID } from '@aura/core';

export interface PasskeyEnrollChallenge {
  challenge: string; // base64url
  rpId: string;
  rpName: string;
  userId: UUID;
  userName: string; // handle
  excludeCredentials: string[]; // already-enrolled credential ids for this user
}

export interface PasskeyAssertChallenge {
  challenge: string;
  rpId: string;
  allowCredentials: string[];
}

/** Begin passkey enrollment — server issues a challenge the device signs. */
export async function beginEnrollment(_userId: UUID): Promise<Result<PasskeyEnrollChallenge>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server generateRegistrationOptions — feature bet'),
  };
}

/** Finish passkey enrollment — verify the device's signed response, store credential. */
export async function finishEnrollment(_payload: unknown): Promise<Result<PasskeyCredential>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server verifyRegistrationResponse — feature bet'),
  };
}

/** Begin sign-in — server issues an authentication challenge. */
export async function beginAssertion(_handle: string): Promise<Result<PasskeyAssertChallenge>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server generateAuthenticationOptions — feature bet'),
  };
}

/** Finish sign-in — verify the device's signed assertion, return user. */
export async function finishAssertion(_payload: unknown): Promise<Result<{ userId: UUID }>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server verifyAuthenticationResponse — feature bet'),
  };
}
