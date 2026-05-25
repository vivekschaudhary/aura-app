/**
 * WebAuthn (passkey) ceremony — primary identity path per architecture
 * § Stack → Auth / identity. The ONLY place server-side WebAuthn runs.
 *
 * Synced passkeys gated by device biometric. Private key never leaves device.
 * Recovery via iCloud Keychain / Google Password Manager + SMS OTP fallback (./otp.ts).
 *
 * Statelessness note: this module does NOT store challenges. Between
 * `beginEnrollment` and `finishEnrollment` the challenge round-trips through
 * the client as an opaque, HMAC-signed token issued by ./challenge-token.ts.
 * Persistence of the resulting credential row is the caller's responsibility
 * (architecture § Boundaries forbids @aura/auth from talking to @aura/db).
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import type { Result, UUID } from '@aura/core';
import {
  signChallengeToken,
  verifyChallengeToken,
  type VerifyResult as ChallengeVerifyResult,
} from './challenge-token.js';

export interface BeginEnrollmentInput {
  userId: UUID;
  /** Display handle — shown in OS biometric UI as the account name. */
  userName: string;
  /** base64url credential ids already enrolled for this user (excluded from re-enrollment). */
  excludeCredentialIds?: string[];
  rpId: string;
  rpName: string;
  /** HMAC secret for the challenge token returned to the client. */
  signingSecret: string;
}

export interface BeginEnrollmentOutput {
  /** Ready-to-pass to `Passkey.create()` on the device. */
  options: PublicKeyCredentialCreationOptionsJSON;
  /** Opaque token the client must echo back to finishEnrollment. */
  challengeToken: string;
}

export interface FinishEnrollmentInput {
  userId: UUID;
  challengeToken: string;
  attestationResponse: RegistrationResponseJSON;
  rpId: string;
  expectedOrigin: string;
  signingSecret: string;
}

export interface FinishEnrollmentOutput {
  /** base64url credential id from the authenticator — natural key for assertion lookup. */
  credentialId: string;
  /** COSE-encoded public key bytes — opaque to us, replayed verbatim during assertion. */
  publicKey: Uint8Array;
  counter: number;
  /** Authenticator model UUID (zero-UUID for anonymous authenticators). */
  aaguid: string;
}

const ZERO_AAGUID = '00000000-0000-0000-0000-000000000000';

/**
 * Begin passkey enrollment — server issues a challenge the device signs.
 *
 * The challenge value is duplicated into the signed token so finishEnrollment
 * can verify the response without server-side state. The client is OPAQUE to
 * the token: it stores and replays it but never inspects it.
 */
export async function beginEnrollment(
  input: BeginEnrollmentInput,
): Promise<Result<BeginEnrollmentOutput>> {
  try {
    const userIdBytes = uuidStringToBytes(input.userId);

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: input.rpName,
      rpID: input.rpId,
      userID: userIdBytes,
      userName: input.userName,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      excludeCredentials: (input.excludeCredentialIds ?? []).map((id) => ({
        id,
        type: 'public-key' as const,
      })),
    };
    const options = await generateRegistrationOptions(opts);

    const challengeToken = signChallengeToken(
      { userId: input.userId, challenge: options.challenge },
      { secret: input.signingSecret },
    );

    return { ok: true, value: { options, challengeToken } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Finish passkey enrollment — verify the device's signed response and return
 * the credential row's raw fields. Caller persists the row to @aura/db.
 */
export async function finishEnrollment(
  input: FinishEnrollmentInput,
): Promise<Result<FinishEnrollmentOutput>> {
  const tokenCheck: ChallengeVerifyResult = verifyChallengeToken(input.challengeToken, {
    secret: input.signingSecret,
  });
  if (!tokenCheck.ok) {
    return {
      ok: false,
      error: new Error(`challenge_token_${tokenCheck.reason}`),
    };
  }
  if (tokenCheck.payload.userId !== input.userId) {
    return { ok: false, error: new Error('challenge_user_mismatch') };
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: input.attestationResponse,
      expectedChallenge: tokenCheck.payload.challenge,
      expectedOrigin: input.expectedOrigin,
      expectedRPID: input.rpId,
      requireUserVerification: true,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false, error: new Error('attestation_verification_failed') };
  }

  const info = verification.registrationInfo;
  const credential = info.credential;
  return {
    ok: true,
    value: {
      credentialId: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      aaguid: info.aaguid && info.aaguid.length > 0 ? info.aaguid : ZERO_AAGUID,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Assertion (returning-user sign-in) — wired in Story 2. Type surface lives
// here so the @simplewebauthn import graph is contained to this module.
// ──────────────────────────────────────────────────────────────────────────────

export interface PasskeyAssertChallenge {
  challenge: string;
  rpId: string;
  allowCredentials: string[];
}

export async function beginAssertion(_handle: string): Promise<Result<PasskeyAssertChallenge>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server generateAuthenticationOptions — Story 2'),
  };
}

export async function finishAssertion(_payload: unknown): Promise<Result<{ userId: UUID }>> {
  return {
    ok: false,
    error: new Error('TODO: wire @simplewebauthn/server verifyAuthenticationResponse — Story 2'),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @simplewebauthn v11 requires `userID` as a `Uint8Array`. Our UUID v7 strings
 * are already 128-bit identifiers; just unpack the hex.
 */
function uuidStringToBytes(uuid: UUID): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
