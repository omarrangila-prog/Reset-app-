"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { AchievementCrystal } from "@/components/ui/AchievementCrystal";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { BackButton } from "@/components/ui/BackButton";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function AchievementsPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  const streak = me?.streak ?? 0;
  const totalLogs = me?.logs?.length ?? 0;

  // Milestones unlock from real data — no fake badges.
  const achievements = [
    { title: "First Step", desc: "Started your journey", unlocked: true },
    { title: "Self-Aware", desc: "Logged your first reflection", unlocked: totalLogs > 0 },
    { title: "Day One", desc: "Completed a full day", unlocked: streak >= 1 },
    { title: "Week Strong", desc: "7-day streak", unlocked: streak >= 7 },
    { title: "Steady", desc: "14-day streak", unlocked: streak >= 14 },
    { title: "Master", desc: "30-day streak", unlocked: streak >= 30 },
  ];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <BackButton fallbackHref="/dashboard" />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Achievements</div>
          <div style={{ fontSize: 12, color: t.muted }}>{unlockedCount} of {achievements.length} unlocked</div>
        </div>
      </header>

      {/* Featured crystal */}
      <Reveal index={0}>
        <div className="mesh" style={{ borderRadius: 28, padding: "28px 20px", marginBottom: 20, textAlign: "center", boxShadow: t.shadowAccent }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <AchievementCrystal size={120} unlocked={unlockedCount > 0} />
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginTop: 12 }}>
              {achievements.filter((a) => a.unlocked).slice(-1)[0]?.title ?? "Getting started"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>Your latest milestone</div>
          </div>
        </div>
      </Reveal>

      {/* Progress to next unlock */}
      {(() => {
        const next = achievements.find((a) => !a.unlocked);
        if (!next) return null;
        // Progress toward the next streak milestone.
        const targets: Record<string, number> = { "Day One": 1, "Week Strong": 7, Steady: 14, Master: 30 };
        const target = targets[next.title] ?? 1;
        const pct = Math.min(1, streak / target);
        return (
          <Reveal index={1}>
            <div style={{ background: "linear-gradient(135deg,#EAF0FF,#F3EEFF)", border: "1px solid #DCE3FF", borderRadius: 22, padding: 18, marginBottom: 22, display: "flex", alignItems: "center", gap: 16 }}>
              <AchievementCrystal size={56} unlocked={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: t.accentText, marginBottom: 4 }}>Next up</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{next.title}</div>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{next.desc} · {Math.round(pct * 100)}% there</div>
                <div style={{ height: 6, background: "var(--bg-tint)", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
                  <div style={{ width: `${pct * 100}%`, height: "100%", background: t.gradHero, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </Reveal>
        );
      })()}

      {/* Collection */}
      <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 12 }}>Your collection</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {achievements.map((a, i) => (
          <Reveal key={a.title} index={i + 2}>
            <Card variant="soft" style={{ textAlign: "center", opacity: a.unlocked ? 1 : 0.6 }}>
              <AchievementCrystal size={64} unlocked={a.unlocked} />
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginTop: 10 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{a.desc}</div>
              {!a.unlocked && <div style={{ fontSize: 10, color: t.accentText, marginTop: 6, fontWeight: 600 }}>Locked</div>}
            </Card>
          </Reveal>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
