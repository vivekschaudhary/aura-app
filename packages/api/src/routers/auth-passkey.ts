/**
 * auth.passkey.* tRPC procedures — the two halves of the WebAuthn enrollment
 * ceremony.
 *
 *   beginEnrollment(userId)
 *     ↳ asks @aura/db for already-enrolled credentials (excluded from this
 *       ceremony so the same authenticator can't double-enroll)
 *     ↳ calls @aura/auth.beginEnrollment to get options + an opaque,
 *       HMAC-signed challenge token the client echoes back to finish
 *     ↳ returns { options, challengeToken }
 *
 *   finishEnrollment({ userId, challengeToken, attestation })
 *     ↳ verifies the token + attestation via @aura/auth.finishEnrollment
 *     ↳ persists the credential row via @aura/db
 *     ↳ logs `auth.passkey_enrolled` to audit_log (story AC8)
 *     ↳ returns a server-signed session token the client stores in
 *       expo-secure-store (consumed by the route guard + future
 *       authenticated procedures in Story 2)
 */

import {
  beginEnrollment as authBeginEnrollment,
  finishEnrollment as authFinishEnrollment,
  signSessionToken,
} from '@aura/auth';
import {
  findUserById,
  hashHandle,
  insertAuditLog,
  insertPasskeyCredential,
  listCredentialIdsForUser,
} from '@aura/db';
import { z } from 'zod';
import { publicProcedure, router, TRPCError } from '../trpc.js';

const beginInput = z.object({
  userId: z.string().uuid(),
});

/**
 * Loose schema — the attestation payload is whatever the WebAuthn spec calls
 * `RegistrationResponseJSON`, an object that varies by authenticator. We
 * pass it through verbatim to @simplewebauthn/server, which is the actual
 * source of truth on shape. Lying about the shape with a strict zod schema
 * would just rot.
 */
const attestationSchema = z.unknown();

const finishInput = z.object({
  userId: z.string().uuid(),
  challengeToken: z.string().min(1),
  attestationResponse: attestationSchema,
});

export const authPasskeyRouter = router({
  beginEnrollment: publicProcedure
    .input(beginInput)
    .mutation(async ({ ctx, input }) => {
      const user = await findUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'user_not_found' });
      }
      const excludeCredentialIds = await listCredentialIdsForUser(input.userId);

      const result = await authBeginEnrollment({
        userId: input.userId,
        userName: user.handle,
        excludeCredentialIds,
        rpId: ctx.config.rpId,
        rpName: ctx.config.rpName,
        signingSecret: ctx.config.webauthnSigningSecret,
      });
      if (!result.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `webauthn_begin_failed:${result.error.message}`,
        });
      }
      return result.value;
    }),

  finishEnrollment: publicProcedure
    .input(finishInput)
    .mutation(async ({ ctx, input }) => {
      const user = await findUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'user_not_found' });
      }

      const verified = await authFinishEnrollment({
        userId: input.userId,
        challengeToken: input.challengeToken,
        // @ts-expect-error — @simplewebauthn types are the authority here; tRPC
        // passes through unknown
        attestationResponse: input.attestationResponse,
        rpId: ctx.config.rpId,
        expectedOrigin: ctx.config.origin,
        signingSecret: ctx.config.webauthnSigningSecret,
      });
      if (!verified.ok) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `webauthn_finish_failed:${verified.error.message}`,
        });
      }

      const credentialRow = await insertPasskeyCredential({
        userId: input.userId,
        credentialId: verified.value.credentialId,
        publicKey: verified.value.publicKey,
        counter: verified.value.counter,
        aaguid: verified.value.aaguid,
      });

      await insertAuditLog({
        eventType: 'auth.passkey_enrolled',
        actorUserId: input.userId,
        entityType: 'passkey_credential',
        entityId: credentialRow.id,
        metadata: {
          handle_hash: hashHandle(user.handle),
          aaguid: verified.value.aaguid,
        },
      });

      const signedToken = signSessionToken(input.userId, ctx.config.sessionSigningSecret);
      return { signedToken };
    }),
});
