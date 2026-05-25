import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm --filter web build',
  installCommand: 'pnpm install --frozen-lockfile',
  outputDirectory: 'apps/web/.next',
  regions: ['bom1'],
  crons: [],
};
