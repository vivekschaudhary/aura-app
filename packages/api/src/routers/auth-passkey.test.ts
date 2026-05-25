import { describe, expect, it, vi, beforeEach } from 'vitest';

const authBeginEnrollment = vi.hoisted(() => vi.fn());
const authFinishEnrollment = vi.hoisted(() => vi.fn());
const signSessionToken = vi.hoisted(() => vi.fn(() => 'session.token'));

const findUserById = vi.hoisted(() => vi.fn());
const listCredentialIdsForUser = vi.hoisted(() => vi.fn());
const insertPasskeyCredential = vi.hoisted(() => vi.fn());
const insertAuditLog = vi.hoisted(() => vi.fn());

vi.mock('@aura/auth', () => ({
  beginEnrollment: authBeginEnrollment,
  finishEnrollment: authFinishEnrollment,
  signSessionToken,
}));

vi.mock('@aura/db', () => ({
  findUserById,
  listCredentialIdsForUser,
  insertPasskeyCredential,
  insertAuditLog,
  hashHandle: (h: string) => `hash:${h}`,
}));

import { createCallerFactory } from '../trpc.js';
import { authPasskeyRouter } from './auth-passkey.js';
import type { Context } from '../context.js';

const createCaller = createCallerFactory(authPasskeyRouter);

const USER_ID = '018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a';

const ctx: Context = {
  userId: null,
  config: {
    rpId: 'aura.app',
    rpName: 'Aura',
    origin: 'https://aura.app',
    webauthnSigningSecret: 'webauthn-test-secret',
    sessionSigningSecret: 'session-test-secret',
  },
};

beforeEach(() => {
  authBeginEnrollment.mockReset();
  authFinishEnrollment.mockReset();
  signSessionToken.mockReset();
  signSessionToken.mockReturnValue('session.token');
  findUserById.mockReset();
  listCredentialIdsForUser.mockReset();
  insertPasskeyCredential.mockReset();
  insertAuditLog.mockReset();
});

describe('auth.passkey.beginEnrollment', () => {
  it('returns options + challengeToken, excluding already-enrolled credential ids', async () => {
    findUserById.mockResolvedValue({ id: USER_ID, handle: 'ravi_2026', primaryLanguage: 'en' });
    listCredentialIdsForUser.mockResolvedValue(['existing-cred-1', 'existing-cred-2']);
    authBeginEnrollment.mockResolvedValue({
      ok: true,
      value: {
        options: { challenge: 'ch-1' },
        challengeToken: 'ch-token',
      },
    });

    const caller = createCaller(ctx);
    const result = await caller.beginEnrollment({ userId: USER_ID });

    expect(result).toEqual({
      options: { challenge: 'ch-1' },
      challengeToken: 'ch-token',
    });
    expect(authBeginEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        userName: 'ravi_2026',
        excludeCredentialIds: ['existing-cred-1', 'existing-cred-2'],
        rpId: 'aura.app',
        rpName: 'Aura',
        signingSecret: 'webauthn-test-secret',
      }),
    );
  });

  it('returns NOT_FOUND when the user row is missing', async () => {
    findUserById.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.beginEnrollment({ userId: USER_ID })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(authBeginEnrollment).not.toHaveBeenCalled();
  });

  it('surfaces ceremony failures as INTERNAL_SERVER_ERROR', async () => {
    findUserById.mockResolvedValue({ id: USER_ID, handle: 'ravi_2026', primaryLanguage: 'en' });
    listCredentialIdsForUser.mockResolvedValue([]);
    authBeginEnrollment.mockResolvedValue({ ok: false, error: new Error('ceremony_dead') });

    const caller = createCaller(ctx);
    await expect(caller.beginEnrollment({ userId: USER_ID })).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});

describe('auth.passkey.finishEnrollment', () => {
  it('verifies, persists, audits, and returns a signed session token', async () => {
    findUserById.mockResolvedValue({ id: USER_ID, handle: 'ravi_2026', primaryLanguage: 'en' });
    authFinishEnrollment.mockResolvedValue({
      ok: true,
      value: {
        credentialId: 'cred-id-base64url',
        publicKey: new Uint8Array([9, 9, 9]),
        counter: 0,
        aaguid: '00000000-0000-0000-0000-000000000001',
      },
    });
    insertPasskeyCredential.mockResolvedValue({
      id: 'cred-row-uuid',
      userId: USER_ID,
      credentialId: 'cred-id-base64url',
      counter: 0,
      aaguid: '00000000-0000-0000-0000-000000000001',
    });
    insertAuditLog.mockResolvedValue(undefined);

    const caller = createCaller(ctx);
    const result = await caller.finishEnrollment({
      userId: USER_ID,
      challengeToken: 'opaque-token',
      attestationResponse: { id: 'x' },
    });

    expect(result).toEqual({ signedToken: 'session.token' });
    expect(insertPasskeyCredential).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        credentialId: 'cred-id-base64url',
        counter: 0,
      }),
    );
    expect(insertAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'auth.passkey_enrolled',
        entityType: 'passkey_credential',
        entityId: 'cred-row-uuid',
        metadata: expect.objectContaining({ handle_hash: 'hash:ravi_2026' }),
      }),
    );
    expect(signSessionToken).toHaveBeenCalledWith(USER_ID, 'session-test-secret');
  });

  it('returns UNAUTHORIZED when ceremony verification fails (e.g. challenge expired)', async () => {
    findUserById.mockResolvedValue({ id: USER_ID, handle: 'ravi_2026', primaryLanguage: 'en' });
    authFinishEnrollment.mockResolvedValue({
      ok: false,
      error: new Error('challenge_token_expired'),
    });

    const caller = createCaller(ctx);
    await expect(
      caller.finishEnrollment({
        userId: USER_ID,
        challengeToken: 'opaque-token',
        attestationResponse: {},
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(insertPasskeyCredential).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when the user row is missing', async () => {
    findUserById.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(
      caller.finishEnrollment({
        userId: USER_ID,
        challengeToken: 'opaque-token',
        attestationResponse: {},
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
