/**
 * tRPC initialization for @aura/api.
 *
 * Per architecture § Contracts: tRPC carries the mobile↔server contract.
 * Routers live here so both apps/web (mounts the HTTP handler) and apps/mobile
 * (consumes types for the client) can import without an apps/* → apps/*
 * workspace coupling.
 *
 * superjson is used as the transformer so Date / Uint8Array / bigint survive
 * the wire — common across our domain types (audit_log occurredAt, passkey
 * publicKey bytes, etc.).
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

/**
 * Stub for procedures that will require an authenticated user in future
 * stories (session-token verification lands when Story 2 wires returning-user
 * passkey assertion). For PR 2 (AUR-5) no procedure needs auth — enrollment
 * is the no-account-yet path.
 */
export const requireAuth = middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign-in required.' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export { TRPCError };
