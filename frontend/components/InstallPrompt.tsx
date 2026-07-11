"use client";

import { useEffect, useState } from "react";

/**
 * "Install app" affordance for the PWA.
 * - Android/Chrome/Edge: captures the beforeinstallprompt event and shows a
 *   button that triggers the native install.
 * - iOS Safari: no such event exists, so we show a one-time hint on how to
 *   "Add to Home Screen".
 * Dismissible; remembers dismissal in localStorage.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install_prompt_dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    // Already installed?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari detection (no beforeinstallprompt support).
    const ua = window.navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome/i.test(ua);
    if (isIOS && isSafari) {
      setIosHint(true);
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    dismiss();
  };

  return (
    <div
      role="dialog"
      aria-label="Install RESET"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 64,
        zIndex: 9998,
        maxWidth: 520,
        margin: "0 auto",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 30px rgba(28,35,51,0.14)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: "#1C2333", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
          Install RESET
        </div>
        <div style={{ color: "#5A6478", fontSize: 12, lineHeight: 1.5 }}>
          {iosHint
            ? "Tap the Share icon, then “Add to Home Screen” for a private, app-like experience."
            : "Add it to your home screen — private, fast, works offline."}
        </div>
      </div>
      {!iosHint && (
        <button
          onClick={install}
          style={{
            background: "linear-gradient(135deg, #5B7CFA, #7C6BF0)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        style={{
          background: "transparent",
          color: "#646E80",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 13,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        Later
      </button>
    </div>
  );
}
