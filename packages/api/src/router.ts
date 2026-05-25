/**
 * App router — the root tRPC router everything else hangs off of.
 *
 * Mounted by apps/web's route handler (`app/api/trpc/[trpc]/route.ts`).
 * Type-imported by apps/mobile for client type inference.
 */

import { router } from './trpc.js';
import { userRouter } from './routers/user.js';
import { authPasskeyRouter } from './routers/auth-passkey.js';

export const appRouter = router({
  user: userRouter,
  auth: router({
    passkey: authPasskeyRouter,
  }),
});

export type AppRouter = typeof appRouter;
