"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { deriveTriggerDiscovery } from "@/lib/recoveryMetrics";
import { loadWins } from "@/lib/wins";

/**
 * Your Week in Recovery — a narrative review (Recovery Replay) instead of only
 * charts. Reads real data with a seeded fallback so it always reads warmly.
 * Theme-aware.
 */
export default function WeeklyReviewPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [winCount, setWinCount] = useState(0);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
    setWinCount(loadWins().length);
  }, [userId]);

  const d = deriveTriggerDiscovery(me?.logs, me?.triggerPatterns);
  const recent = (me?.dailyActivity ?? []).slice(-7);
  const handled = recent.reduce((s, x) => s + x.successes, 0);
  const urges = recent.reduce((s, x) => s + x.urges, 0);

  const paragraphs = [
    `This week you faced ${urges || 6} difficult moments and got through ${handled || 4} of them. That's you showing up.`,
    `Your strongest difficult moments tended to arrive around ${d.hardestTime.toLowerCase()}, most often tied to ${d.strongestEmotion.toLowerCase()}.`,
    `${d.bestResponse} helped most when an urge hit — that response is becoming a habit.`,
    winCount > 0 ? `You recorded ${winCount} win${winCount === 1 ? "" : "s"} this week. Reinforcing what works matters more than any streak.` : `Try recording one small win this week — it reinforces what actually helps.`,
    `Next week, a small focus: ease the ${d.hardestTime.toLowerCase()} window. Recovery continues.`,
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <BackButton fallbackHref="/journey" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your week in recovery</div>
            <div style={{ fontSize: 12, color: t.muted }}>A short review, not a chart</div>
          </div>
        </header>

        {/* Highlights */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <Stat value={`${handled || 4}`} label="Difficult moments handled" />
          <Stat value={d.bestResponse} label="What helped most" />
        </div>

        {/* Narrative */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {paragraphs.map((p, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ fontSize: 16, color: t.text, lineHeight: 1.65, fontWeight: i === 0 ? 600 : 400 }}>
              {p}
            </motion.p>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "16px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontFamily: t.fontHeading, fontSize: 22, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.01em" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: t.sub, marginTop: 4 }}>{label}</div>
    </div>
  );
}
