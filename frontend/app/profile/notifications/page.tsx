"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { t } from "@/components/ui/theme";

const OPTIONS = [
  { key: "checkin", label: "Daily check-in", desc: "A gentle nudge to log how you're doing" },
  { key: "night", label: "Late-night support", desc: "A caring reminder when urges are most likely" },
  { key: "wins", label: "Celebrate small wins", desc: "A note when you hit a milestone" },
  { key: "lessons", label: "New lessons", desc: "When a helpful short read is added" },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{ width: 48, height: 28, borderRadius: 999, border: "none", background: on ? t.accent : t.borderMid, position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s", minHeight: 28 }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

export default function NotificationsPage() {
  const [state, setState] = useState<Record<string, boolean>>({ checkin: true, night: true, wins: true, lessons: false });

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("notif_prefs") || "null");
      if (s) setState(s);
    } catch {}
  }, []);

  const toggle = (k: string) => {
    const next = { ...state, [k]: !state[k] };
    setState(next);
    localStorage.setItem("notif_prefs", JSON.stringify(next));
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/profile" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Reminders</div>
          <div style={{ fontSize: 12, color: t.muted }}>Only what helps. Turn off anything you don&apos;t want.</div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {OPTIONS.map((o) => (
          <Card key={o.key} variant="soft">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{o.label}</div>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{o.desc}</div>
              </div>
              <Toggle on={!!state[o.key]} onClick={() => toggle(o.key)} />
            </div>
          </Card>
        ))}
      </div>
      <p style={{ fontSize: 12, color: t.muted, marginTop: 16, textAlign: "center" }}>
        You&apos;re always in control. These stay on your device.
      </p>

      <BottomNav />
    </div>
  );
}
