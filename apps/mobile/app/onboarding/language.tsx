import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Language } from '@aura/core';
import { useI18n } from '../../lib/i18n';

/**
 * Language Picker — first interactive screen on first-open.
 *
 * Two large tap-targets (English / हिन्दी), stacked vertically, centered.
 * No header, no welcome screen (per AUR-5 brief Decision PM-2, 2026-05-24).
 *
 * Selection is persisted via I18nProvider, then navigates to /onboarding/handle.
 */
export default function LanguagePicker() {
  const { t, setLanguage, isReady } = useI18n();

  if (!isReady) return null; // brief flash protection while storage is read

  const pick = async (next: Language) => {
    await setLanguage(next);
    router.replace('/onboarding/handle');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('language.title')}</Text>

        <Pressable
          style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${t('language.option.en')}, button`}
          onPress={() => pick('en')}
        >
          <Text style={styles.tileText}>{t('language.option.en')}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${t('language.option.hi')}, button, Hindi`}
          onPress={() => pick('hi')}
        >
          <Text style={styles.tileText}>{t('language.option.hi')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 36,
    textAlign: 'center',
  },
  tile: {
    width: '80%',
    minHeight: 56,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePressed: { backgroundColor: '#f5f5f5', transform: [{ scale: 0.99 }] },
  tileText: { fontSize: 22, fontWeight: '500' },
});
