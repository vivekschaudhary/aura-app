import { type VercelConfig } from '@vercel/config/v1';

/**
 * Vercel config — lives at the repo root with the Turborepo monorepo pattern.
 *
 * Dashboard MUST have:
 *   - Root Directory: cleared / repo root (NO override)
 *   - Build Command: cleared (vercel.ts drives)
 *   - Install Command: cleared (vercel.ts drives)
 *   - Output Directory: cleared (vercel.ts drives)
 *   - Framework Preset: Next.js (auto-detected because root package.json now
 *     has `next` as a phantom devDep — never imported, only there to satisfy
 *     Vercel's "is this a Next.js project?" detection check)
 *
 * Why this pattern:
 *   - Avoids the Root Directory ↔ workspace-lockfile interaction (with Root
 *     Directory at the repo root, pnpm-lock.yaml is right there)
 *   - Avoids the dashboard ↔ vercel.ts override fights
 *   - Turbo handles workspace dependency graph + build ordering
 *   - One source of config truth (this file)
 *
 * regions: function execution region, NOT build region. Builds run in iad1
 * (Vercel default); deployed functions execute in bom1 (Mumbai) per
 * architecture § Stack → Deployment.
 */
export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm turbo run build --filter=web',
  installCommand: 'pnpm install --frozen-lockfile',
  outputDirectory: 'apps/web/.next',
  regions: ['bom1'],
  crons: [],
};
