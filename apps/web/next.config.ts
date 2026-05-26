import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@aura/api', '@aura/auth', '@aura/ai', '@aura/core', '@aura/db'],
  typedRoutes: true,
  experimental: {
    // Cache Components (PPR) — opt in per page as features ship.
  },
};

export default config;
