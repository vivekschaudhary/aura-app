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
import { getLanguage, setHandle as persistHandle, setUserId } from '../../lib/storage';
import { trpc } from '../../lib/trpc';

type CheckState = 'idle' | 'checking' | 'invalid' | 'taken' | 'network' | 'ok';

/**
 * Normalize raw input: strip surrounding whitespace + lowercase. Per Codex
 * P1 review of PR #1 (`apps/mobile/app/onboarding/handle.tsx:44-55`):
 * `handleSchema` only accepts `[a-z0-9_]`, so a user typing `Ravi_2026`
 * or autofill adding a trailing space was silently failing validation.
 * We normalize on every keystroke so the visible input matches what gets
 * sent to the server.
 */
function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Handle Entry screen.
 *
 * Inline validation against `@aura/core` handleSchema (3–32 chars, [a-z0-9_]).
 * Submit calls `user.checkHandle` then `user.create` (single round trip via
 * tRPC batch). On 'CONFLICT' (handle taken) the field clears and the user
 * retries; copy.md handle.error.taken renders inline.
 */
export default function HandleEntry() {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const [state, setState] = useState<CheckState>('idle');

  const utils = trpc.useUtils();
  const createUser = trpc.user.create.useMutation();

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
      const availability = await utils.user.checkHandle.fetch({ handle: value });
      if (!availability.available) {
        setState('taken');
        setValue('');
        return;
      }
      const language = (await getLanguage()) ?? 'en';
      const { userId } = await createUser.mutateAsync({
        handle: value,
        primaryLanguage: language,
      });
      await Promise.all([persistHandle(value), setUserId(userId)]);
      setState('ok');
      router.push('/onboarding/passkey');
    } catch (err) {
      if (isHandleTaken(err)) {
        setState('taken');
        setValue('');
        return;
      }
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
              setValue(normalizeHandle(next));
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

function isHandleTaken(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { data?: { code?: string }; message?: string };
  return e.data?.code === 'CONFLICT' || e.message === 'handle_taken';
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
