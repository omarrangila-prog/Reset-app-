"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";

const GOAL_OPTIONS = [
  "Stop completely",
  "Cut back slowly",
  "Understand my triggers",
  "Feel more in control",
  "Sleep and feel better",
];

export default function GoalsPage() {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("goals") || "[]");
      if (Array.isArray(saved)) setSelected(saved);
    } catch {}
  }, []);

  const toggle = (g: string) => {
    const next = selected.includes(g) ? selected.filter((x) => x !== g) : [...selected, g];
    setSelected(next);
    localStorage.setItem("goals", JSON.stringify(next));
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/profile" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your goals</div>
          <div style={{ fontSize: 12, color: t.muted }}>What matters to you — pick as many as you like</div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GOAL_OPTIONS.map((g, i) => {
          const on = selected.includes(g);
          return (
            <Reveal key={g} index={i}>
              <Card variant="soft" onClick={() => toggle(g)} ariaLabel={g}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, border: on ? "none" : `1.5px solid ${t.borderMid}`, background: on ? t.gradHero : "transparent", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }} aria-hidden>{on ? "✓" : ""}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{g}</span>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: t.muted, marginTop: 16, textAlign: "center" }}>Saved automatically. There&apos;s no wrong answer.</p>

      <BottomNav />
    </div>
  );
}
