import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../lib/i18n';

/**
 * Not Supported screen.
 *
 * Shown when capability detection in `lib/passkey.ts` reports the device
 * cannot create a passkey. No CTA, no waitlist UI (per design.md DRI
 * Decision 2026-05-24) — OTP fallback ships in Story 2 once MSG91 is unblocked
 * by OPS-001.
 *
 * Static screen: nothing for the user to do here except close the app and
 * check back later.
 */
export default function NotSupported() {
  const { t } = useI18n();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('unsupported.title')}</Text>
        <Text style={styles.body}>{t('unsupported.body')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
  },
});
