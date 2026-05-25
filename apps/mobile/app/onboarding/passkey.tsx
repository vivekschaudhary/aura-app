import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../lib/i18n';
import { isPasskeySupported } from '../../lib/passkey';
import { setSignedToken } from '../../lib/storage';

type State = 'ready' | 'finalising' | 'cancelled' | 'network';

/**
 * Passkey Enrollment screen.
 *
 * Single-screen explanation + one button. Tapping triggers the OS biometric
 * prompt via `react-native-passkey`; on success the screen navigates to home.
 *
 * Capability detection runs silently on mount — if the device can't create a
 * passkey, redirect to Not Supported before showing any of this screen.
 */
export default function PasskeyEnrollment() {
  const { t } = useI18n();
  const [state, setState] = useState<State>('ready');

  useEffect(() => {
    if (!isPasskeySupported()) {
      router.replace('/onboarding/not-supported');
    }
  }, []);

  const onContinue = async () => {
    setState('finalising');
    try {
      // TODO (PR 2): wire to tRPC auth.passkey.beginEnrollment + Passkey.create
      // + auth.passkey.finishEnrollment. Real flow:
      //   1. tRPC begin → server returns WebAuthn challenge
      //   2. createPasskey(challenge) → OS biometric prompt → signed attestation
      //   3. tRPC finish → server verifies, writes passkey_credentials row,
      //      returns signed handle token
      //   4. setSignedToken(token); router.replace('/')
      // Stub for PR 1: pretend success, write a placeholder token so the
      // route guard treats us as enrolled. Real implementation gated on OPS-001.
      await new Promise((r) => setTimeout(r, 600));
      await setSignedToken('AUR5-PR1-STUB-TOKEN');
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
