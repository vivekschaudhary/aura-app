import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../lib/i18n';
import { createPasskey, isPasskeySupported } from '../../lib/passkey';
import {
  getUserId,
  setOnboardingTerminated,
  setSignedToken,
} from '../../lib/storage';
import { trpc } from '../../lib/trpc';

type State = 'ready' | 'finalising' | 'cancelled' | 'network';

/**
 * Passkey Enrollment screen.
 *
 * Capability detection on mount — devices without passkey support write the
 * `onboardingTerminated` sentinel (Codex P1 review of PR #1) and route to
 * `/onboarding/not-supported`. The sentinel makes the not-supported state
 * sticky across cold launches instead of looping the user through
 * onboarding repeatedly.
 *
 * Happy path:
 *   1. tRPC `auth.passkey.beginEnrollment` → options + opaque challengeToken
 *   2. `Passkey.create(options)` → OS biometric prompt → signed attestation
 *   3. tRPC `auth.passkey.finishEnrollment(challengeToken, attestation)`
 *      → server verifies, writes `passkey_credentials` row, returns session
 *      token
 *   4. Persist token; navigate to home.
 */
export default function PasskeyEnrollment() {
  const { t } = useI18n();
  const [state, setState] = useState<State>('ready');

  const beginEnrollment = trpc.auth.passkey.beginEnrollment.useMutation();
  const finishEnrollment = trpc.auth.passkey.finishEnrollment.useMutation();

  useEffect(() => {
    if (!isPasskeySupported()) {
      void (async () => {
        await setOnboardingTerminated();
        router.replace('/onboarding/not-supported');
      })();
    }
  }, []);

  // Block Android hardware back while this screen is focused. Returning true
  // from the listener swallows the event (RN BackHandler contract). Per Codex
  // P2 review of PR #2 — the onboarding stack's `gestureEnabled: false` only
  // suppresses iOS swipe-back; Android needs an explicit handler.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  const onContinue = async () => {
    setState('finalising');
    try {
      const userId = await getUserId();
      if (!userId) {
        // Shouldn't be reachable — the route guard sends unenrolled users
        // through handle.tsx first, which persists the userId.
        throw new Error('missing_user_id');
      }

      const { options, challengeToken } = await beginEnrollment.mutateAsync({ userId });

      const attestation = await createPasskey(options);

      const { signedToken } = await finishEnrollment.mutateAsync({
        userId,
        challengeToken,
        attestationResponse: attestation,
      });

      await setSignedToken(signedToken);
      router.replace('/');
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : '';
      setState(message.includes('cancel') ? 'cancelled' : 'network');
    }
  };

  const errorString = state === 'cancelled'
    ? t('passkey.error.cancelled')
    : state === 'network'
      ? t('passkey.error.network')
      : null;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('passkey.title')}</Text>
        <Text style={styles.body}>{t('passkey.body')}</Text>

        {errorString ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorBlockText}>{errorString}</Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.submit, pressed && styles.submitPressed]}
          onPress={onContinue}
          disabled={state === 'finalising'}
          accessibilityRole="button"
          accessibilityLabel={t('passkey.submit')}
        >
          <Text style={styles.submitText}>
            {state === 'finalising' ? t('passkey.finalising') : t('passkey.submit')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 18,
  },
  title: { fontSize: 24, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 24, color: '#444' },
  errorBlock: {
    backgroundColor: '#fff5f5',
    borderColor: '#feb2b2',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  errorBlockText: { color: '#c53030', fontSize: 14 },
  submit: {
    marginTop: 24,
    minHeight: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  submitPressed: { opacity: 0.9 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
