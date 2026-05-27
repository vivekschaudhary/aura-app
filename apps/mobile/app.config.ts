import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Aura',
  slug: 'aura',
  scheme: 'aura',
  version: '0.0.1',
  newArchEnabled: true,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: 'app.aura.ios',
    supportsTablet: false,
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Aura uses your microphone so you can speak in the language you think in.',
    },
  },
  android: {
    package: 'app.aura.android',
    permissions: ['RECORD_AUDIO'],
  },
  extra: {
    // EAS project id placeholder — set after `eas init`
    eas: {
      projectId: 'TODO_SET_AFTER_EAS_INIT',
    },
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-av'],
};

export default config;
