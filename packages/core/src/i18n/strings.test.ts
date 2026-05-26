/**
 * String-registry coverage test.
 * Guards AC7 ("All user-facing strings appear in the selected language").
 *
 * Adding a new string requires updating both en + hi tables; this test catches
 * any drift between them. Adding a new language requires extending Language
 * union — this test will catch that too.
 */

import { describe, expect, it } from 'vitest';
import { strings, stringIds, t } from './strings';

describe('i18n strings', () => {
  it('has identical key coverage across all languages', () => {
    const languages = Object.keys(strings) as Array<keyof typeof strings>;
    for (const lang of languages) {
      const keys = Object.keys(strings[lang]).sort();
      expect(keys).toEqual([...stringIds].sort());
    }
  });

  it('has no empty values in any language', () => {
    for (const [lang, table] of Object.entries(strings)) {
      for (const [id, value] of Object.entries(table)) {
        expect(value, `${lang}.${id} must be non-empty`).toBeTruthy();
        expect(
          value.trim().length,
          `${lang}.${id} must not be whitespace-only`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('interpolates {placeholders}', () => {
    expect(t('en', 'home.welcome', { handle: 'ravi_2026' })).toBe(
      'Welcome, ravi_2026.',
    );
    expect(t('hi', 'home.welcome', { handle: 'ravi_2026' })).toBe(
      'आपका स्वागत है, ravi_2026.',
    );
  });

  it('returns raw string when no vars passed', () => {
    expect(t('en', 'language.title')).toBe('Choose your language');
    expect(t('hi', 'language.title')).toBe('अपनी भाषा चुनिए');
  });

  it('keeps the brand name "Aura" in Latin script in both languages', () => {
    // Per UX Writer Decision 2026-05-24: brand stays Latin even in Hindi.
    expect(strings.en['home.footer']).toContain('Aura');
    expect(strings.hi['home.footer']).toContain('Aura');
    expect(strings.en['passkey.body']).toContain('Aura');
    expect(strings.hi['passkey.body']).toContain('Aura');
  });

  it('handle.placeholder is Latin-only (handleSchema is [a-z0-9_])', () => {
    // Handle field accepts only [a-z0-9_]; example must demonstrate that.
    // Devanagari handles are an open P2 Issue per AUR-1 brief; not in scope for AUR-5.
    const latinOnly = /^[\sa-zA-Z0-9_.,—]+$/;
    expect(strings.en['handle.placeholder']).toMatch(latinOnly);
    // Hindi version uses "जैसे" prefix but the example handle stays Latin.
    expect(strings.hi['handle.placeholder']).toContain('ravi_2026');
  });
});
