/**
 * tRPC HTTP handler — entry point for mobile↔server calls.
 *
 * Per architecture § Contracts: tRPC for mobile↔server; Server Actions for
 * web↔server. Router definitions live in @aura/api so the mobile client can
 * type-import the AppRouter without an apps/* → apps/* workspace coupling.
 *
 * Runtime: Node.js (Fluid Compute) — node:crypto is used by @aura/auth for
 * HMAC challenge tokens. Do NOT switch to Edge.
 */

import { appRouter, createContext } from '@aura/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };

export const dynamic = 'force-dynamic';
