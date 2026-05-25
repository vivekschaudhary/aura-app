import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { I18nProvider } from '../lib/i18n';
import { getHandle, getSignedToken } from '../lib/storage';

/**
 * Root layout — wraps the app in I18nProvider and runs the route guard.
 *
 * Route guard logic (per AUR-5 tech notes):
 *   - On cold-launch, check secure storage for signed handle token.
 *   - If present → user is enrolled → route to `/` (home stub).
 *   - If absent → user hasn't enrolled → route to `/onboarding/language`.
 *
 * Back-gesture rules (per design.md):
 *   - Onboarding stack screens disable swipe-back (see app/onboarding/_layout.tsx).
 *   - Root home stack does not include onboarding screens in its stack.
 */
export default function RootLayout() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [handle, token] = await Promise.all([getHandle(), getSignedToken()]);
      if (cancelled) return;
      if (!handle || !token) {
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
    <I18nProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </I18nProvider>
  );
}
