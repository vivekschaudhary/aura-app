import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { handleSchema } from '@aura/core';
import { useI18n } from '../../lib/i18n';
import { setHandle as persistHandle } from '../../lib/storage';

type CheckState = 'idle' | 'checking' | 'invalid' | 'taken' | 'network' | 'ok';

/**
 * Handle Entry screen.
 *
 * Inline validation against `@aura/core` handleSchema (3–32 chars, [a-z0-9_]).
 * Submit triggers a uniqueness check (PR 2 will wire tRPC user.checkHandle;
 * for now the check is a local stub that always succeeds — flagged with TODO).
 */
export default function HandleEntry() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [state, setState] = useState<CheckState>('idle');

  const liveValidation = (() => {
    if (!value) return null;
    const parsed = handleSchema.safeParse(value);
    if (parsed.success) return null;
    const issue = parsed.error.issues[0]?.message ?? '';
    if (issue.includes('lowercase letters')) return t('handle.error.invalid_chars');
    if (issue.includes('at least 3')) return t('handle.error.too_short');
    if (issue.includes('at most 32')) return t('handle.error.too_long');
    return t('handle.error.invalid_chars');
  })();

  const canSubmit = !!value && !liveValidation && state !== 'checking';

  const onSubmit = async () => {
    if (!canSubmit) return;
    setState('checking');
    try {
      // TODO (PR 2): replace stub with tRPC user.checkHandle + user.create.
      // Stub: assume the handle is available so the happy path can be exercised
      // locally. Real uniqueness check requires Supabase (blocked on OPS-001).
      await new Promise((r) => setTimeout(r, 300));
      await persistHandle(value);
      setState('ok');
      router.push('/onboarding/passkey');
    } catch {
      setState('network');
    }
  };

  const submitError = state === 'taken'
    ? t('handle.error.taken')
    : state === 'network'
      ? t('handle.error.network')
      : null;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('handle.title')}</Text>

          {submitError ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorBlockText}>{submitError}</Text>
            </View>
          ) : null}

          <TextInput
            value={value}
            onChangeText={(next) => {
              setValue(next);
              if (state === 'taken' || state === 'network') setState('idle');
            }}
            placeholder={t('handle.placeholder')}
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel={t('handle.title')}
          />

          <Text
            style={[styles.helper, liveValidation && styles.helperError]}
            accessibilityLiveRegion="polite"
          >
            {liveValidation ?? t('handle.helper')}
          </Text>

          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.submit,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.submitPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('handle.submit')}
          >
            {state === 'checking' ? (
              <View style={styles.submitContent}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitText}>{t('handle.checking')}</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>{t('handle.submit')}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '500', marginBottom: 12 },
  input: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    paddingVertical: 12,
  },
  helper: { fontSize: 14, color: '#666' },
  helperError: { color: '#c53030' },
  errorBlock: {
    backgroundColor: '#fff5f5',
    borderColor: '#feb2b2',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
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
  submitContent: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  submitDisabled: { backgroundColor: '#bbb' },
  submitPressed: { opacity: 0.9 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
