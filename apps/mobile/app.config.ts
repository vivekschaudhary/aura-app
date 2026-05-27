import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Aura',
  slug: 'aura-app',
  scheme: 'aura',
  version: '0.0.1',
  newArchEnabled: true,
  orientation: 'portrait',
  // icon + splash use Expo defaults for the dev build. Branded assets
  // ship before TestFlight (separate story per design.md).
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.kindtree.aura',
    supportsTablet: false,
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Aura uses your microphone so you can speak in the language you think in.',
    },
  },
  android: {
    package: 'com.kindtree.aura',
    permissions: ['RECORD_AUDIO'],
  },
  extra: {
    eas: {
      projectId: '7331f1ee-c90c-4467-b4a4-4e5bf6feaa91',
    },
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-av'],
};

export default config;
