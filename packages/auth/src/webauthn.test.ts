import { describe, expect, it, vi, beforeEach } from 'vitest';

const generateRegistrationOptions = vi.hoisted(() => vi.fn());
const verifyRegistrationResponse = vi.hoisted(() => vi.fn());

vi.mock('@simplewebauthn/server', () => ({
  generateRegistrationOptions,
  verifyRegistrationResponse,
}));

import { beginEnrollment, finishEnrollment } from './webauthn';
import { signChallengeToken } from './challenge-token';

const SECRET = 'test-secret-32-bytes-of-entropy.';
const USER_ID = '018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a';

beforeEach(() => {
  generateRegistrationOptions.mockReset();
  verifyRegistrationResponse.mockReset();
});

describe('beginEnrollment', () => {
  it('returns options + a verifiable challenge token', async () => {
    generateRegistrationOptions.mockResolvedValue({
      challenge: 'ch-abc-123',
      rp: { id: 'aura.app', name: 'Aura' },
      user: { id: new Uint8Array(16), name: 'ravi_2026' },
      pubKeyCredParams: [],
      excludeCredentials: [],
    });

    const result = await beginEnrollment({
      userId: USER_ID,
      userName: 'ravi_2026',
      rpId: 'aura.app',
      rpName: 'Aura',
      signingSecret: SECRET,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.challenge).toBe('ch-abc-123');
      expect(typeof result.value.challengeToken).toBe('string');
      expect(result.value.challengeToken.split('.').length).toBe(2);
    }
    expect(generateRegistrationOptions).toHaveBeenCalledOnce();
  });

  it('surfaces underlying ceremony errors as Result<error>', async () => {
    generateRegistrationOptions.mockRejectedValue(new Error('boom'));
    const result = await beginEnrollment({
      userId: USER_ID,
      userName: 'ravi_2026',
      rpId: 'aura.app',
      rpName: 'Aura',
      signingSecret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('boom');
  });
});

describe('finishEnrollment', () => {
  it('verifies a matching challenge + attestation, returns credential bytes', async () => {
    const challengeToken = signChallengeToken(
      { userId: USER_ID, challenge: 'ch-abc-123' },
      { secret: SECRET },
    );
    verifyRegistrationResponse.mockResolvedValue({
      verified: true,
      registrationInfo: {
        aaguid: '00000000-0000-0000-0000-000000000001',
        credential: {
          id: 'cred-id-base64url',
          publicKey: new Uint8Array([1, 2, 3]),
          counter: 0,
        },
      },
    });

    const result = await finishEnrollment({
      userId: USER_ID,
      challengeToken,
      attestationResponse: { id: 'cred-id-base64url' } as never,
      rpId: 'aura.app',
      expectedOrigin: 'https://aura.app',
      signingSecret: SECRET,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.credentialId).toBe('cred-id-base64url');
      expect(result.value.aaguid).toBe('00000000-0000-0000-0000-000000000001');
      expect(result.value.counter).toBe(0);
      expect(result.value.publicKey).toEqual(new Uint8Array([1, 2, 3]));
    }
  });

  it('rejects when challenge token user mismatches input userId', async () => {
    const challengeToken = signChallengeToken(
      { userId: 'other-user-id', challenge: 'ch' },
      { secret: SECRET },
    );
    const result = await finishEnrollment({
      userId: USER_ID,
      challengeToken,
      attestationResponse: {} as never,
      rpId: 'aura.app',
      expectedOrigin: 'https://aura.app',
      signingSecret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('challenge_user_mismatch');
    expect(verifyRegistrationResponse).not.toHaveBeenCalled();
  });

  it('rejects when challenge token is signed by a different secret', async () => {
    const challengeToken = signChallengeToken(
      { userId: USER_ID, challenge: 'ch' },
      { secret: 'different-secret-different-bytes.' },
    );
    const result = await finishEnrollment({
      userId: USER_ID,
      challengeToken,
      attestationResponse: {} as never,
      rpId: 'aura.app',
      expectedOrigin: 'https://aura.app',
      signingSecret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('challenge_token_bad_signature');
  });

  it('rejects when @simplewebauthn reports unverified', async () => {
    const challengeToken = signChallengeToken(
      { userId: USER_ID, challenge: 'ch' },
      { secret: SECRET },
    );
    verifyRegistrationResponse.mockResolvedValue({ verified: false });
    const result = await finishEnrollment({
      userId: USER_ID,
      challengeToken,
      attestationResponse: {} as never,
      rpId: 'aura.app',
      expectedOrigin: 'https://aura.app',
      signingSecret: SECRET,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('attestation_verification_failed');
  });
});
