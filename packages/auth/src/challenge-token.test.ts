import { describe, expect, it } from 'vitest';
import {
  signChallengeToken,
  signSessionToken,
  verifyChallengeToken,
  verifySessionToken,
} from './challenge-token.js';

const SECRET = 'test-secret-32-bytes-of-entropy.';
const OTHER_SECRET = 'different-secret-different-bytes.';

describe('signChallengeToken / verifyChallengeToken', () => {
  it('roundtrips a valid token', () => {
    const token = signChallengeToken(
      { userId: '018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a', challenge: 'YWJjZGVm' },
      { secret: SECRET },
    );
    const result = verifyChallengeToken(token, { secret: SECRET });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.userId).toBe('018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a');
      expect(result.payload.challenge).toBe('YWJjZGVm');
      expect(result.payload.exp).toBeGreaterThan(Date.now());
    }
  });

  it('rejects a token signed by a different secret', () => {
    const token = signChallengeToken(
      { userId: 'u', challenge: 'c' },
      { secret: SECRET },
    );
    const result = verifyChallengeToken(token, { secret: OTHER_SECRET });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_signature');
  });

  it('rejects an expired token', () => {
    const token = signChallengeToken(
      { userId: 'u', challenge: 'c' },
      { secret: SECRET, ttlMs: 1 },
    );
    const result = verifyChallengeToken(token, {
      secret: SECRET,
      now: Date.now() + 1000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });

  it('rejects a malformed token (missing dot)', () => {
    const result = verifyChallengeToken('not-a-token', { secret: SECRET });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('malformed');
  });

  it('rejects a tampered body (signature stays valid only over original body)', () => {
    const token = signChallengeToken(
      { userId: 'u', challenge: 'original' },
      { secret: SECRET },
    );
    const [, sig] = token.split('.');
    const forgedBody = Buffer.from(
      JSON.stringify({ userId: 'attacker', challenge: 'forged', exp: Date.now() + 60_000 }),
      'utf8',
    ).toString('base64url');
    const tampered = `${forgedBody}.${sig}`;
    const result = verifyChallengeToken(tampered, { secret: SECRET });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_signature');
  });
});

describe('signSessionToken / verifySessionToken', () => {
  it('roundtrips a valid session token', () => {
    const token = signSessionToken('user-1', SECRET);
    const result = verifySessionToken(token, SECRET);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.userId).toBe('user-1');
  });

  it('rejects a wrong-secret session token', () => {
    const token = signSessionToken('user-1', SECRET);
    const result = verifySessionToken(token, OTHER_SECRET);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('bad_signature');
  });

  it('rejects an expired session token', () => {
    const token = signSessionToken('user-1', SECRET, 1);
    const result = verifySessionToken(token, SECRET, Date.now() + 1000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });
});
