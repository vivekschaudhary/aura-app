import { type VercelConfig } from '@vercel/config/v1';

/**
 * Vercel config — lives here (apps/web) rather than at the repo root so the
 * dashboard's framework detection reads apps/web/package.json (which has
 * `next`) instead of the workspace root (which has only tooling).
 *
 * Root Directory in the Vercel project settings MUST be `apps/web`. With that:
 *   - installCommand runs from apps/web. pnpm walks up to the workspace root
 *     (via pnpm-workspace.yaml) and installs all workspace packages.
 *   - buildCommand uses `pnpm --filter web build` — pnpm finds the workspace
 *     and runs the filter from anywhere in the tree.
 *   - outputDirectory is `.next` (relative to apps/web).
 *   - regions pin to `bom1` per architecture § Stack → Deployment.
 */
export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm --filter web build',
  installCommand: 'pnpm install --frozen-lockfile',
  outputDirectory: '.next',
  regions: ['bom1'],
  crons: [],
};
