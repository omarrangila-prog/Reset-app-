"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { Reveal, spring } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";

interface Habit {
  id: string;
  name: string;
  icon: string;
  accent: string;
  streak: number;
  doneToday: boolean;
}

const INITIAL: Habit[] = [
  { id: "walk", name: "15-minute walk", icon: "◈", accent: t.mint, streak: 5, doneToday: false },
  { id: "reflect", name: "Morning reflection", icon: "◐", accent: t.accent, streak: 12, doneToday: true },
  { id: "sleep", name: "Sleep before 11 PM", icon: "☾", accent: t.accent2, streak: 3, doneToday: false },
  { id: "read", name: "Read 10 pages", icon: "❏", accent: t.sky, streak: 8, doneToday: false },
];

function CompletionRing({ done, accent }: { done: boolean; accent: string }) {
  const size = 44, stroke = 3, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.border} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animate={{ strokeDashoffset: done ? 0 : c }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: done ? accent : t.muted, fontSize: 16 }}>
        {done ? "✓" : ""}
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState(INITIAL);
  const doneCount = habits.filter((h) => h.doneToday).length;

  const toggle = (id: string) =>
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday, streak: h.doneToday ? h.streak - 1 : h.streak + 1 } : h)));

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <Reveal index={0}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Habits</h1>
            <p style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{doneCount} of {habits.length} done today</p>
          </div>
          <div className="mesh" style={{ padding: "10px 16px", borderRadius: 16, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: t.shadowAccent }}>
            <span style={{ position: "relative", zIndex: 1 }}>{Math.round((doneCount / habits.length) * 100)}%</span>
          </div>
        </header>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {habits.map((h, i) => (
          <Reveal key={h.id} index={i + 1}>
            <Card variant="soft" onClick={() => toggle(h.id)} ariaLabel={`Toggle ${h.name}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 46, height: 46, borderRadius: 14, background: `${h.accent}18`, color: h.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }} aria-hidden>{h.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{h.name}</div>
                  <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>🔥 {h.streak} day streak</div>
                </div>
                <motion.div whileTap={{ scale: 0.9 }} transition={spring}>
                  <CompletionRing done={h.doneToday} accent={h.accent} />
                </motion.div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal index={habits.length + 1}>
        <button style={{ width: "100%", marginTop: 16, padding: "16px", background: "transparent", border: `1.5px dashed ${t.borderMid}`, borderRadius: 16, color: t.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 52 }}>
          + Create a new habit
        </button>
      </Reveal>

      <BottomNav />
    </div>
  );
}
