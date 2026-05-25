import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { I18nProvider } from '../lib/i18n';
import { TRPCProvider } from '../lib/trpc';
import { getHandle, getOnboardingTerminated, getSignedToken } from '../lib/storage';

/**
 * Root layout — wraps the app in I18nProvider + TRPCProvider and runs the
 * route guard.
 *
 * Mounting order matters (per Codex P1 review of PR #2): Expo Router throws
 * "Attempted to navigate before mounting the Root Layout" if `router.replace`
 * is called from a render path that returned `null`. So the Stack is rendered
 * on every paint — we just hide it behind an opacity-0 overlay until the route
 * guard resolves, then unhide. No content-flash, no navigator-not-mounted bug.
 *
 * Route guard logic (per AUR-5 tech notes):
 *   1. If `onboardingTerminated` sentinel is set (device didn't support
 *      passkeys) → /onboarding/not-supported (Codex P1 fix from PR #1).
 *   2. Else if handle + signed token both present → / (home stub).
 *   3. Else → /onboarding/language.
 *
 * Back-gesture rules (per design.md) live in app/onboarding/_layout.tsx +
 * each restricted screen's `useFocusEffect`.
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

  return (
    <TRPCProvider>
      <I18nProvider>
        {/*
          Stack must be mounted on first paint so router.replace can route
          into it from the useEffect above. The opacity-0 wrapper hides the
          initial route's content (typically the home stub) for the ~one
          frame it takes the guard to resolve, avoiding a visible flash.
        */}
        <View style={{ flex: 1, opacity: checked ? 1 : 0 }} accessible={checked}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </I18nProvider>
    </TRPCProvider>
  );
}
