import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@aura/api', '@aura/auth', '@aura/ai', '@aura/core', '@aura/db'],
  typedRoutes: true,
  experimental: {
    // Cache Components (PPR) — opt in per page as features ship.
  },
  async headers() {
    return [
      {
        // Apple App Site Association — required Content-Type per spec.
        // File lives at apps/web/public/.well-known/apple-app-site-association
        // (no .json extension — Apple validator rejects extensions).
        source: '/.well-known/apple-app-site-association',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        // Android Digital Asset Links — same pattern; required when
        // assetlinks.json file is added (post first EAS Android build,
        // when SHA-256 cert fingerprint is known).
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};

export default config;
