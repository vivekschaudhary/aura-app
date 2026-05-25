import { Stack } from 'expo-router';

/**
 * Onboarding flow layout.
 *
 * Back-gesture policy (per design.md DRI Decision 2026-05-24):
 *   - Disable Android hardware back + iOS swipe-back on Passkey + Not Supported screens.
 *   - Allow back Handle → Language (one-tap to redo language pick).
 *   - Per-screen overrides via `options` below.
 *
 * Per-screen `gestureEnabled: false` blocks the iOS swipe gesture; on Android
 * the hardware-back disable is handled inside each screen via BackHandler.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // safe default for the onboarding stack
      }}
    >
      <Stack.Screen name="language" />
      <Stack.Screen name="handle" options={{ gestureEnabled: true }} />
      <Stack.Screen name="passkey" />
      <Stack.Screen name="not-supported" />
    </Stack>
  );
}
