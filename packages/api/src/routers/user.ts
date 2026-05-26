/**
 * user.* tRPC procedures — handle uniqueness check + user-row create.
 *
 * Architecture § Boundaries: routers are the only layer that may touch both
 * @aura/auth (ceremony) and @aura/db (persistence). The procedures stay
 * dumb on purpose: schema parse, hand to db, audit-log, return.
 */

import { handleSchema, languageSchema } from '@aura/core';
import { checkHandleAvailability, hashHandle, insertAuditLog, insertUser } from '@aura/db';
import { z } from 'zod';
import { publicProcedure, router, TRPCError } from '../trpc';

const checkHandleInput = z.object({ handle: handleSchema });

const createInput = z.object({
  handle: handleSchema,
  primaryLanguage: languageSchema,
});

export const userRouter = router({
  /**
   * AC3 — handle uniqueness check before the user commits.
   * Returns `{ available: false }` on collision (UI shows the `handle.error.taken`
   * string and clears the field per copy.md).
   */
  checkHandle: publicProcedure
    .input(checkHandleInput)
    .query(async ({ input }) => {
      const available = await checkHandleAvailability(input.handle);
      return { available };
    }),

  /**
   * AC2 + AC8 — writes the `users` row and emits the corresponding audit
   * event. Race with another concurrent enrollment surfaces as a citext
   * uniqueness violation; the procedure maps it to a CONFLICT for the
   * mobile client (UI re-renders the same `taken` state).
   */
  create: publicProcedure
    .input(createInput)
    .mutation(async ({ input }) => {
      try {
        const row = await insertUser({
          handle: input.handle,
          primaryLanguage: input.primaryLanguage,
        });
        await insertAuditLog({
          eventType: 'user.created',
          actorUserId: row.id,
          entityType: 'user',
          entityId: row.id,
          metadata: {
            handle_hash: hashHandle(row.handle),
            primary_language: row.primaryLanguage,
          },
        });
        return { userId: row.id };
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'handle_taken',
          });
        }
        throw err;
      }
    }),
});

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { code?: string };
  return e.code === '23505';
}
