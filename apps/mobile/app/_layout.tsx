import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { I18nProvider } from '../lib/i18n';
import { TRPCProvider } from '../lib/trpc';
import { getHandle, getOnboardingTerminated, getSignedToken } from '../lib/storage';

/**
 * Root layout — wraps the app in I18nProvider + TRPCProvider and runs the
 * route guard.
 *
 * Route guard logic (per AUR-5 tech notes + Codex PR #1 review):
 *   1. If onboarding-terminated sentinel is set (device didn't support
 *      passkeys) → straight to /onboarding/not-supported. No loop through
 *      language → handle → passkey.
 *   2. Else if handle + signed token both present → user is enrolled → land
 *      on / (home stub).
 *   3. Else → start onboarding at /onboarding/language.
 *
 * Back-gesture rules (per design.md) live in app/onboarding/_layout.tsx.
 */
export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [handle, token, terminated] = await Promise.all([
        getHandle(),
        getSignedToken(),
        getOnboardingTerminated(),
      ]);
      if (cancelled) return;
      if (terminated) {
        router.replace('/onboarding/not-supported');
      } else if (!handle || !token) {
        router.replace('/onboarding/language');
      }
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Suppress rendering until route guard has decided where to send the user.
  // Avoids a flash of the home stub for unenrolled users.
  if (!checked) return null;

  return (
    <TRPCProvider>
      <I18nProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </I18nProvider>
    </TRPCProvider>
  );
}
