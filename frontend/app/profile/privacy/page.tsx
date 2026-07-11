"use client";

import { useState } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { PrivacyShield } from "@/components/ui/PrivacyShield";
import { t } from "@/components/ui/theme";
import { BackButton } from "@/components/ui/BackButton";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function PrivacyCenterPage() {
  const clearSession = useAppStore((s) => s.clearSession);
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");
  const [confirming, setConfirming] = useState(false);

  const exportData = () => { window.location.href = api.exportUrl; };

  const deleteAll = async () => {
    setStatus("deleting");
    try {
      await api.deleteAccount();
      clearSession();
      localStorage.clear();
      if ("indexedDB" in window) indexedDB.deleteDatabase("reset-identity");
      setStatus("deleted");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <BackButton fallbackHref="/profile" />
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your privacy</div>
      </header>

      <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
        <PrivacyShield size={92} />
        <p style={{ fontSize: 15, color: t.text, fontWeight: 600, marginTop: 8 }}>This is yours, and only yours.</p>
        <p style={{ fontSize: 13, color: t.sub, marginTop: 4, lineHeight: 1.6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
          No name, no email needed. Your notes are locked so only you can read them. You can take your data or erase it any time.
        </p>
      </div>

      <Card variant="soft" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6 }}>Get a copy of your data</div>
        <p style={{ fontSize: 13, color: t.sub, lineHeight: 1.6, marginBottom: 14 }}>Download everything saved for you as a simple file. It belongs to you.</p>
        <button onClick={exportData} style={{ width: "100%", padding: "14px", background: t.gradHero, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>Download my data</button>
      </Card>

      <Card variant="soft" style={{ border: `1px solid ${t.danger}33` }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6 }}>Erase everything</div>
        <p style={{ fontSize: 13, color: t.sub, lineHeight: 1.6, marginBottom: 14 }}>Permanently delete all your data. This can&apos;t be undone.</p>
        {status === "deleted" ? (
          <p style={{ color: t.emerald, fontSize: 14 }}>All your data has been erased. Take care of yourself. 💙</p>
        ) : !confirming ? (
          <button onClick={() => setConfirming(true)} style={{ width: "100%", padding: "14px", background: "transparent", color: t.danger, border: `1px solid ${t.danger}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>Erase everything</button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>Are you sure? This can&apos;t be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={deleteAll} disabled={status === "deleting"} style={{ flex: 1, padding: "12px", background: t.danger, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>{status === "deleting" ? "Erasing…" : "Yes, erase it all"}</button>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: "12px", background: "transparent", color: t.sub, border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 14, cursor: "pointer", minHeight: 44 }}>Keep it</button>
            </div>
            {status === "error" && <p role="alert" style={{ color: t.danger, fontSize: 13 }}>Something went wrong. Please try again.</p>}
          </div>
        )}
      </Card>

      <BottomNav />
    </div>
  );
}
