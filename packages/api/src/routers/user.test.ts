import { describe, expect, it, vi, beforeEach } from 'vitest';

const checkHandleAvailability = vi.hoisted(() => vi.fn());
const insertUser = vi.hoisted(() => vi.fn());
const insertAuditLog = vi.hoisted(() => vi.fn());

vi.mock('@aura/db', () => ({
  checkHandleAvailability,
  insertUser,
  insertAuditLog,
  hashHandle: (h: string) => `hash:${h}`,
}));

import { createCallerFactory } from '../trpc.js';
import { userRouter } from './user.js';
import type { Context } from '../context.js';

const createCaller = createCallerFactory(userRouter);

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
  checkHandleAvailability.mockReset();
  insertUser.mockReset();
  insertAuditLog.mockReset();
});

describe('user.checkHandle', () => {
  it('returns { available: true } when the handle is free', async () => {
    checkHandleAvailability.mockResolvedValue(true);
    const caller = createCaller(ctx);
    const result = await caller.checkHandle({ handle: 'ravi_2026' });
    expect(result).toEqual({ available: true });
    expect(checkHandleAvailability).toHaveBeenCalledWith('ravi_2026');
  });

  it('returns { available: false } when the handle is taken', async () => {
    checkHandleAvailability.mockResolvedValue(false);
    const caller = createCaller(ctx);
    const result = await caller.checkHandle({ handle: 'taken_one' });
    expect(result).toEqual({ available: false });
  });

  it('rejects handles that fail handleSchema (e.g. uppercase)', async () => {
    const caller = createCaller(ctx);
    await expect(caller.checkHandle({ handle: 'BadHandle' })).rejects.toThrow();
    expect(checkHandleAvailability).not.toHaveBeenCalled();
  });
});

describe('user.create', () => {
  it('inserts the user row and emits an audit log', async () => {
    insertUser.mockResolvedValue({
      id: '018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a',
      handle: 'ravi_2026',
      primaryLanguage: 'hi',
    });
    insertAuditLog.mockResolvedValue(undefined);

    const caller = createCaller(ctx);
    const result = await caller.create({
      handle: 'ravi_2026',
      primaryLanguage: 'hi',
    });

    expect(result).toEqual({ userId: '018e2b16-7baf-7e3a-bc41-2a0a0b0a0a0a' });
    expect(insertUser).toHaveBeenCalledWith({
      handle: 'ravi_2026',
      primaryLanguage: 'hi',
    });
    expect(insertAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'user.created',
        entityType: 'user',
        metadata: expect.objectContaining({
          handle_hash: 'hash:ravi_2026',
          primary_language: 'hi',
        }),
      }),
    );
  });

  it('maps a citext unique violation (Postgres code 23505) to CONFLICT', async () => {
    const err = Object.assign(new Error('duplicate key'), { code: '23505' });
    insertUser.mockRejectedValue(err);

    const caller = createCaller(ctx);
    await expect(
      caller.create({ handle: 'ravi_2026', primaryLanguage: 'en' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(insertAuditLog).not.toHaveBeenCalled();
  });

  it('rethrows non-uniqueness errors', async () => {
    insertUser.mockRejectedValue(new Error('connection refused'));

    const caller = createCaller(ctx);
    await expect(
      caller.create({ handle: 'ravi_2026', primaryLanguage: 'en' }),
    ).rejects.toThrow('connection refused');
  });

  it('rejects invalid language values', async () => {
    const caller = createCaller(ctx);
    await expect(
      caller.create({ handle: 'ravi_2026', primaryLanguage: 'fr' as never }),
    ).rejects.toThrow();
    expect(insertUser).not.toHaveBeenCalled();
  });
});
