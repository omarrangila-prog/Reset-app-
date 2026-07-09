"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { t } from "@/components/ui/theme";
import { api, LogEntry } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const MOOD_COLOR: Record<string, string> = {
  Happy: "#F0B24B", Calm: "#5B7CFA", Neutral: "#7C6BF0", Anxious: "#EC6A5E",
  Lonely: "#4FB6F5", Angry: "#E5687C", Tired: "#34C9A3", Low: "#8A93A6",
};

export default function MoodHistoryPage() {
  const { userId } = useAppStore();
  const [moods, setMoods] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    api.getLogs(100)
      .then((logs) => setMoods(logs.filter((l) => l.type === "CHECK_IN" && l.emotion)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // Simple weekly summary: count of each mood.
  const counts: Record<string, number> = {};
  moods.forEach((m) => { if (m.emotion) counts[m.emotion] = (counts[m.emotion] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>How you&apos;ve felt</div>
          <div style={{ fontSize: 12, color: t.muted }}>Your check-ins over time</div>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", color: t.muted, fontSize: 13, padding: 32 }}>Loading…</div>
      ) : moods.length === 0 ? (
        <>
          <FeatureIntro
            what="Each time you check in on the Mood screen, it shows up here — so you can see how you've been feeling."
            time="10 seconds to check in"
            benefit="Notice patterns without overthinking"
          />
          <Card variant="tint" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>Nothing here yet</div>
            <div style={{ fontSize: 13, color: t.sub, marginBottom: 14 }}>Tap a mood on the Mood screen and it&apos;ll appear here.</div>
            <Link href="/journey/mood" style={{ display: "inline-flex", padding: "12px 20px", background: t.gradHero, color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 600, minHeight: 44, alignItems: "center" }}>Check in now</Link>
          </Card>
        </>
      ) : (
        <>
          {/* Summary */}
          <Card variant="soft" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: t.muted, marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Most common lately</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {top.slice(0, 4).map(([mood, count]) => {
                const max = top[0][1];
                return (
                  <div key={mood} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 60, fontSize: 13, color: t.text, fontWeight: 500 }}>{mood}</span>
                    <div style={{ flex: 1, height: 8, background: t.bgTint, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: MOOD_COLOR[mood] || t.accent, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, color: t.muted, width: 20, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {moods.map((m) => (
              <Card key={m.id} variant="soft">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: MOOD_COLOR[m.emotion || ""] || t.accent, flexShrink: 0 }} aria-hidden />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.text }}>{m.emotion}</span>
                  <span style={{ fontSize: 12, color: t.muted }}>
                    {new Date(m.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
