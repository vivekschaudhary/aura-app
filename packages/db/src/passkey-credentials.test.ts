import { describe, expect, it } from 'vitest';
import { bytesToPgHex, pgHexToBytes } from './passkey-credentials';

/**
 * Per Codex P1 review of PR #2 commit 3092843 — bytea encoding bugs broke the
 * passkey persistence path. These tests guard the helpers that talk to
 * Supabase/PostgREST in both directions. Integration-against-real-Postgres
 * tests are still deferred (blocked on OPS-001), but these unit tests catch
 * the exact regression Codex flagged.
 */

describe('bytesToPgHex', () => {
  it('encodes empty bytes as the bare \\x prefix', () => {
    expect(bytesToPgHex(new Uint8Array([]))).toBe('\\x');
  });

  it('encodes a known sequence', () => {
    expect(bytesToPgHex(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]))).toBe('\\x68656c6c6f');
  });

  it('emits lowercase hex (matches Postgres bytea_output = hex default)', () => {
    expect(bytesToPgHex(new Uint8Array([0xab, 0xcd, 0xef]))).toBe('\\xabcdef');
  });
});

describe('pgHexToBytes', () => {
  it('decodes the \\x-prefixed hex Postgres returns', () => {
    expect(pgHexToBytes('\\x68656c6c6f')).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]));
  });

  it('decodes empty bytea (\\x with nothing after)', () => {
    expect(pgHexToBytes('\\x')).toEqual(new Uint8Array([]));
  });

  it('falls back to base64 decoding when the \\x prefix is absent (defensive)', () => {
    // 'aGVsbG8=' is base64 for 'hello'
    expect(pgHexToBytes('aGVsbG8=')).toEqual(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]));
  });
});

describe('roundtrip', () => {
  it('bytes → pgHex → bytes is identity', () => {
    const cases: Uint8Array[] = [
      new Uint8Array([]),
      new Uint8Array([0]),
      new Uint8Array([255]),
      new Uint8Array(Array.from({ length: 32 }, (_, i) => (i * 7) & 0xff)),
      // simulate a typical WebAuthn credential id (~16-64 bytes random)
      new Uint8Array(Array.from({ length: 32 }, (_, i) => (i * 31 + 17) & 0xff)),
    ];
    for (const bytes of cases) {
      const hex = bytesToPgHex(bytes);
      const back = pgHexToBytes(hex);
      expect(back).toEqual(bytes);
    }
  });
});
