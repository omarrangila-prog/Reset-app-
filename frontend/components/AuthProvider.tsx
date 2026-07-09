"use client";

import { useEffect } from "react";
import { ensureDeviceSession } from "@/lib/deviceIdentity";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

/**
 * Establishes the anonymous device session on first load and hydrates the
 * store with the user's real profile. Renders nothing.
 */
export function AuthProvider() {
  const setUserId = useAppStore((s) => s.setUserId);
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const userId = await ensureDeviceSession();
      if (cancelled) return;
      setUserId(userId);
      if (userId) {
        try {
          const me = await api.getMe();
          if (!cancelled) setUser(me);
        } catch {
          /* profile load is non-fatal for boot */
        }
      }
      if (!cancelled) setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setUserId, setUser, setAuthReady]);

  return null;
}
