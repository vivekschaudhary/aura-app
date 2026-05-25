/**
 * Health check — used by Vercel + Uptime monitors.
 * Should stay cheap and side-effect-free; do NOT touch the DB in v1.
 */

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'aura-web',
    timestamp: new Date().toISOString(),
  });
}
