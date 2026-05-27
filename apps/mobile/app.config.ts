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
    // Associated Domains — iOS reads these at install time to establish
    // which domains the app is allowed to bind WebAuthn / universal links
    // to. Without webcredentials:<rpId>, WebAuthn calls fail with
    // "RequestFailed: No Credentials were returned" (the AC4 smoke
    // failure mode observed 2026-05-27 on the local-built dev .ipa).
    // The matching AASA file is served from apps/web/public/.well-known/.
    associatedDomains: [
      'webcredentials:aura-web-kind-tree.vercel.app',
      'applinks:aura-web-kind-tree.vercel.app',
    ],
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
