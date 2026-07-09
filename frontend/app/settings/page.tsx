"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/ui/BottomNav";

const T = {
  bg: "#F5F7FC",
  surface: "#FFFFFF",
  text: "#1C2333",
  sub: "#5A6478",
  border: "#E6EAF2",
  recovery: "#2FBE6E",
  amber: "#5B7CFA",
  danger: "#E5687C",
};

export default function SettingsPage() {
  const clearSession = useAppStore((s) => s.clearSession);
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");
  const [confirming, setConfirming] = useState(false);

  const handleExport = () => {
    // Opens the authenticated export endpoint; the browser downloads the file.
    window.location.href = api.exportUrl;
  };

  const handleDelete = async () => {
    setStatus("deleting");
    try {
      await api.deleteAccount();
      clearSession();
      // Also clear any local preferences and identity key store.
      localStorage.clear();
      if ("indexedDB" in window) indexedDB.deleteDatabase("reset-identity");
      setStatus("deleted");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "24px 24px 120px", background: T.bg, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
      <BottomNav />
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: 24, margin: 0, letterSpacing: "0.12em" }}>
              Settings
            </h1>
            <p style={{ fontSize: 14, color: T.sub, margin: "8px 0 0 0" }}>Control your data and privacy in one place.</p>
          </div>
          <Link href="/" style={{ color: T.text, textDecoration: "underline", fontSize: 13, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
            Back home
          </Link>
        </div>

        {/* Export */}
        <section style={{ background: T.surface, padding: 24, borderRadius: 18, border: `1px solid ${T.border}`, marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Export your data</h2>
          <p style={{ color: T.sub, lineHeight: 1.7, marginBottom: 20 }}>
            Download everything RESET has stored for you — streak history, logs, and journal entries — as a JSON file. Your data belongs to you.
          </p>
          <button
            onClick={handleExport}
            style={{ width: "100%", padding: "16px 18px", background: T.recovery, color: "#000", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 44 }}
          >
            Download my data
          </button>
        </section>

        {/* Delete */}
        <section style={{ background: T.surface, padding: 24, borderRadius: 18, border: `1px solid ${T.danger}44` }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px 0" }}>Delete your account</h2>
          <p style={{ color: T.sub, lineHeight: 1.7, marginBottom: 20 }}>
            This permanently erases <strong>all</strong> of your data from our servers — profile, streak, logs, and journal — and cannot be undone.
          </p>

          {status === "deleted" ? (
            <p style={{ color: T.recovery }}>
              Your account and all data have been permanently deleted. Take care of yourself.
            </p>
          ) : !confirming ? (
            <button
              onClick={() => setConfirming(true)}
              style={{ width: "100%", padding: "16px 18px", background: "transparent", color: T.danger, border: `1px solid ${T.danger}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 44 }}
            >
              Delete everything
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: T.text, fontWeight: 600 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleDelete}
                  disabled={status === "deleting"}
                  style={{ flex: 1, padding: "14px 18px", background: T.danger, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44, opacity: status === "deleting" ? 0.7 : 1 }}
                >
                  {status === "deleting" ? "Deleting…" : "Yes, delete permanently"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  style={{ flex: 1, padding: "14px 18px", background: "transparent", color: T.sub, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 14, cursor: "pointer", minHeight: 44 }}
                >
                  Keep my account
                </button>
              </div>
              {status === "error" && (
                <p role="alert" style={{ color: T.danger, fontSize: 13 }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
