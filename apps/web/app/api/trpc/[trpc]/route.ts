/**
 * tRPC HTTP handler — entry point for mobile↔server calls.
 * Per architecture § Contracts: tRPC for mobile↔server; Server Actions for web↔server.
 * Procedure routers ship under feature bets (session.start, memory.recall, etc.).
 */

export async function GET() {
  return new Response('tRPC handler not yet wired — feature bet stub', { status: 501 });
}

export async function POST() {
  return new Response('tRPC handler not yet wired — feature bet stub', { status: 501 });
}
