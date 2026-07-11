"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, ArrowRight } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { haptic } from "@/lib/haptics";

/**
 * First 7-Day Recovery Journey — a guided path so new users have momentum.
 * Days unlock one per calendar day from when the journey starts (stored
 * locally). Completing a day is manual + celebratory. Theme-aware, private.
 */
const DAYS = [
  { title: "Understand your triggers", body: "Notice when and why difficult moments tend to happen.", action: { label: "Set up your profile", href: "/profile/recovery" } },
  { title: "Build your Urge Plan", body: "Decide your steps now, while you're calm.", action: { label: "Build my plan", href: "/urge/plan" } },
  { title: "Learn Calm Mode", body: "Try the 3-minute reset so it's familiar when you need it.", action: { label: "Open Calm Mode", href: "/urge" } },
  { title: "Journal after a difficult moment", body: "Reflection turns a hard moment into a lesson.", action: { label: "Write a note", href: "/journey/journal" } },
  { title: "Change one environmental trigger", body: "Small changes make recovery easier than willpower alone.", action: { label: "Environment checklist", href: "/urge/environment" } },
  { title: "Review your patterns", body: "See what's emerging in your Insights.", action: { label: "See insights", href: "/dashboard" } },
  { title: "Celebrate progress", body: "Record a win and choose your next focus.", action: { label: "Add a victory", href: "/wins" } },
];

const KEY = "reset_journey7";

interface State { startDay: string; completed: number[] }

export default function SevenDayJourney() {
  const [state, setState] = useState<State>({ startDay: new Date().toISOString().split("T")[0], completed: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
      else { const init = { startDay: new Date().toISOString().split("T")[0], completed: [] }; localStorage.setItem(KEY, JSON.stringify(init)); setState(init); }
    } catch {}
  }, []);

  const dayNumber = Math.min(7, Math.floor((Date.now() - new Date(state.startDay).getTime()) / 86400000) + 1);
  const complete = (i: number) => {
    haptic("achievement");
    setState((s) => {
      const next = { ...s, completed: s.completed.includes(i) ? s.completed : [...s.completed, i] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const doneCount = state.completed.length;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/journey" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your first 7 days</div>
            <div style={{ fontSize: 12, color: t.muted }}>{doneCount} of 7 complete</div>
          </div>
        </header>

        <div style={{ borderRadius: 20, padding: "16px 18px", margin: "16px 0 22px", background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}` }}>
          <p style={{ fontSize: 14.5, color: t.text, lineHeight: 1.55 }}>A gentle first week. One small step each day builds momentum — go at your own pace.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DAYS.map((d, i) => {
            const unlocked = i < dayNumber;
            const done = state.completed.includes(i);
            const isCurrent = unlocked && !done && i === state.completed.length;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 18, opacity: unlocked ? 1 : 0.55,
                  background: isCurrent ? "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))" : "var(--bg-surface)",
                  border: `1px solid ${isCurrent ? t.accent : t.border}`, boxShadow: unlocked ? "var(--shadow-sm)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700,
                  background: done ? "var(--recovery)" : unlocked ? "var(--grad-hero)" : t.bgTint, color: done || unlocked ? "#fff" : t.muted, boxShadow: done || (unlocked && isCurrent) ? "var(--shadow-accent)" : "none" }}>
                  {done ? <Check size={16} strokeWidth={3} /> : unlocked ? i + 1 : <Lock size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>Day {i + 1}</div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: t.text, marginBottom: 3 }}>{d.title}</div>
                  <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.5, marginBottom: unlocked && !done ? 12 : 0 }}>{d.body}</div>
                  {unlocked && !done && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Link href={d.action.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, background: "var(--grad-hero)", color: "#fff", fontSize: 13, fontWeight: 600, minHeight: 40, boxShadow: "var(--shadow-accent)" }}>
                        {d.action.label} <ArrowRight size={14} />
                      </Link>
                      <button onClick={() => complete(i)} style={{ padding: "9px 14px", borderRadius: 999, background: "transparent", border: `1px solid ${t.border}`, color: t.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 40 }}>Mark done</button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
