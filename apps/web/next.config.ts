import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@aura/core', '@aura/ai', '@aura/db', '@aura/auth'],
  typedRoutes: true,
  experimental: {
    // Cache Components (PPR) — opt in per page as features ship.
  },
};

export default config;
