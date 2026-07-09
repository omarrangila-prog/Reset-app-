import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/memoryStore";
import { getUserIdFromRequest, SESSION_COOKIE_NAME } from "@/lib/auth";

/** Return the current session's userId, or 401. Used by the client to bootstrap. */
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId || !store.getUser(userId)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, userId });
}

/** Logout: clear the session cookie. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
