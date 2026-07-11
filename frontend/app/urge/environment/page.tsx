"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { haptic } from "@/lib/haptics";

/**
 * Change Your Environment — small physical changes make recovery easier than
 * willpower alone. Checked items persist locally (private). Theme-aware.
 */
const ITEMS = [
  "Move to another room",
  "Put your phone somewhere else",
  "Leave your bed",
  "Open a window",
  "Drink water",
  "Go outside for 5 minutes",
  "Turn on the room lights",
  "Block distracting websites",
  "Enable content filters",
  "Keep your phone outside the bedroom at night",
];
const KEY = "reset_env_checklist";

export default function EnvironmentPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) setChecked(s); } catch {}
  }, []);

  const toggle = (item: string) => {
    haptic("tap");
    setChecked((c) => {
      const next = { ...c, [item]: !c[item] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const doneCount = ITEMS.filter((i) => checked[i]).length;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/urge" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Change your environment</div>
            <div style={{ fontSize: 12, color: t.muted }}>{doneCount} of {ITEMS.length} done</div>
          </div>
        </header>

        <div style={{ borderRadius: 20, padding: "16px 18px", margin: "16px 0 22px", background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}` }}>
          <p style={{ fontSize: 14.5, color: t.text, lineHeight: 1.55 }}>
            Recovery is easier when you change your environment — not just rely on willpower. Pick one or two right now.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ITEMS.map((item, i) => {
            const on = !!checked[item];
            return (
              <motion.button key={item} onClick={() => toggle(item)} role="checkbox" aria-checked={on}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, minHeight: 54, cursor: "pointer", textAlign: "left",
                  background: on ? "var(--accent-soft)" : "var(--bg-surface)", border: `1px solid ${on ? t.accent : t.border}`, color: t.text, boxShadow: on ? "none" : "var(--shadow-sm)" }}>
                <span aria-hidden style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, border: `2px solid ${on ? t.accent : t.border}`, background: on ? t.accent : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  {on && <Check size={14} strokeWidth={3.5} />}
                </span>
                <span style={{ fontSize: 15, fontWeight: on ? 600 : 500, color: t.text, textDecoration: on ? "none" : "none" }}>{item}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
