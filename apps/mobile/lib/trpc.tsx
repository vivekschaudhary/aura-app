/**
 * tRPC client + React Query provider for the mobile app.
 *
 * AppRouter is type-imported from @aura/api — no runtime dependency on
 * apps/web. The HTTP base URL comes from `EXPO_PUBLIC_API_BASE_URL` (see
 * lib/env.ts) so the same binary can point at local dev or a Vercel preview.
 *
 * The `Authorization: Bearer <signedToken>` header is wired in for future
 * authenticated procedures (Story 2 — returning-user assertion + memory
 * recall). For PR 2 no procedure requires it; the header is sent if present
 * and ignored if not.
 */

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink, type CreateTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@aura/api';
import { getApiBaseUrl } from './env';
import { getSignedToken } from './storage';

// Explicit type annotation prevents TS from inlining a non-portable path to
// `@aura/auth/src` in the inferred return type (TS2742). The annotation
// stays anchored to the @aura/api type boundary instead of leaking through
// it.
export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
          mutations: { retry: 0 },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiBaseUrl()}/api/trpc`,
          transformer: superjson,
          async headers() {
            const token = await getSignedToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
