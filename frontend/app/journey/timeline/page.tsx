"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

/**
 * Reflection Timeline — the "recovery map" as a vertical milestone journey.
 * Milestones unlock from real streak/log data, so it stays honest.
 */
export default function TimelinePage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  const streak = me?.streak ?? 0;
  const journeyStart = me?.createdAt ? new Date(me.createdAt) : new Date();

  const milestones = [
    { label: "Started your journey", done: true, note: journeyStart.toLocaleDateString() },
    { label: "First reflection logged", done: (me?.logs?.length ?? 0) > 0, note: "Awareness begins" },
    { label: "First day complete", done: streak >= 1, note: "Day 1" },
    { label: "First week", done: streak >= 7, note: "7 days of rising" },
    { label: "Two weeks strong", done: streak >= 14, note: "Momentum building" },
    { label: "One month — Mastery path", done: streak >= 30, note: "30 days" },
  ];

  const stages = ["Awareness", "Control", "Consistency", "Mastery"];
  const stageIdx = streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 3 ? 1 : 0;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your recovery map</div>
          <div style={{ fontSize: 12, color: t.muted }}>Progress, not just numbers</div>
        </div>
      </header>

      {/* Stage progress */}
      <Reveal index={0}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {stages.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 6, borderRadius: 3, background: i <= stageIdx ? t.gradHero : t.border, marginBottom: 6 }} />
              <div style={{ fontSize: 10, color: i <= stageIdx ? t.accent : t.muted, fontWeight: i === stageIdx ? 700 : 500 }}>{s}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Milestone timeline */}
      <div style={{ position: "relative", paddingLeft: 8 }}>
        {milestones.map((m, i) => (
          <Reveal key={m.label} index={i + 1}>
            <div style={{ display: "flex", gap: 16, position: "relative", paddingBottom: i === milestones.length - 1 ? 0 : 24 }}>
              {/* connector line */}
              {i < milestones.length - 1 && (
                <div style={{ position: "absolute", left: 13, top: 28, bottom: 0, width: 2, background: m.done ? `${t.accent}55` : t.border }} />
              )}
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: m.done ? t.gradHero : t.surface,
                  border: m.done ? "none" : `2px solid ${t.border}`,
                  boxShadow: m.done ? t.shadowAccent : "none",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13,
                }}
                aria-hidden
              >
                {m.done ? "✓" : ""}
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: m.done ? t.text : t.muted }}>{m.label}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{m.note}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
