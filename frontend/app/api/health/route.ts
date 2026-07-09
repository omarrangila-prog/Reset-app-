import { NextResponse } from "next/server";

/**
 * Health check for uptime monitoring. Reports config presence (not values) and
 * that the process is up. Uses an in-memory store, so there is no DB to ping.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    store: "sqlite (persistent)",
    checks: {
      encryptionKey: Boolean(process.env.APP_ENCRYPTION_KEY),
      sessionSecret: Boolean(process.env.SESSION_SECRET),
      groqKey: Boolean(process.env.GROQ_API_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
