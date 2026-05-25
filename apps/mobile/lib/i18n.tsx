/**
 * Mobile-side i18n hook + provider.
 *
 * Wraps the bilingual string registry from `@aura/core/i18n`. The currently
 * active Language is held in React state, seeded from secure storage on first
 * render. Switching language is synchronous in memory + async-persisted.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { i18n, type Language } from '@aura/core';
import { getLanguage, setLanguage as persistLanguage } from './storage';

const { t: tFn } = i18n;

interface I18nContextValue {
  language: Language;
  isReady: boolean;
  setLanguage: (language: Language) => Promise<void>;
  t: (id: i18n.StringId, vars?: Readonly<Record<string, string>>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getLanguage();
      if (cancelled) return;
      if (stored) setLanguageState(stored);
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    setLanguageState(next);
    await persistLanguage(next);
  }, []);

  const t = useCallback(
    (id: i18n.StringId, vars?: Readonly<Record<string, string>>) => tFn(language, id, vars),
    [language],
  );

  const value = useMemo(
    () => ({ language, isReady, setLanguage, t }),
    [language, isReady, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

/** Shorthand for components that only need `t`. */
export function useT(): I18nContextValue['t'] {
  return useI18n().t;
}
