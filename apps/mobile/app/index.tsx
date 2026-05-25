import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../lib/i18n';
import { getHandle } from '../lib/storage';

/**
 * Home Stub — landing surface after enrollment.
 *
 * Static placeholder per AUR-5 design.md (Vivek 2026-05-24): no conversation
 * input bar (AUR-2 ships the conversation surface). Reads handle from secure
 * storage to interpolate the welcome string.
 */
export default function Home() {
  const { t } = useI18n();
  const [handle, setHandle] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const h = await getHandle();
      if (!cancelled && h) setHandle(h);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.welcome}>{t('home.welcome', { handle: handle || '…' })}</Text>
        <Text style={styles.placeholder}>{t('home.placeholder')}</Text>
      </View>
      <View style={styles.footerWrap}>
        <Text style={styles.footer}>{t('home.footer')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  welcome: { fontSize: 28, fontWeight: '500', textAlign: 'center' },
  placeholder: { fontSize: 16, color: '#666', textAlign: 'center' },
  footerWrap: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footer: { fontSize: 13, color: '#999' },
});
