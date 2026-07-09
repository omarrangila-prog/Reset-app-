"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function AnalyticsPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    api.getMe().then(setMe).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  // Build last-14-days series from real daily activity.
  const days = (me?.dailyActivity ?? []).slice(-14);
  const chart = days.map((d) => ({
    day: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })[0],
    urges: d.urges,
    wins: d.successes,
  }));
  const hasData = chart.some((c) => c.urges > 0 || c.wins > 0);

  const totalWins = days.reduce((s, d) => s + d.successes, 0);
  const totalUrges = days.reduce((s, d) => s + d.urges, 0);

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/dashboard" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>See what&apos;s helping</div>
          <div style={{ fontSize: 12, color: t.muted }}>Your last two weeks, at a glance</div>
        </div>
      </header>

      <FeatureIntro
        what="A simple picture of how your last two weeks went — the moments you got through and the days you showed up."
        time="Look for 30 seconds"
        benefit="See your progress, not just today"
      />

      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={3} /></div>
      ) : !hasData ? (
        <Card variant="tint" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>Your picture is still forming</div>
          <div style={{ fontSize: 13, color: t.sub }}>As you check in and get through moments, this fills in on its own.</div>
        </Card>
      ) : (
        <>
          {/* Summary tiles */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Card variant="soft" style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Moments you got through</div>
              <div style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.emerald }}>{totalWins}</div>
            </Card>
            <Card variant="soft" style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Urges you faced</div>
              <div style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.accent }}>{totalUrges}</div>
            </Card>
          </div>

          {/* Wins over time */}
          <Card variant="soft" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 12 }}>Days you showed up</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chart}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: t.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${t.border}`, fontSize: 12 }} />
                <Line type="monotone" dataKey="wins" stroke={t.emerald} strokeWidth={2.5} dot={false} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Urges faced */}
          <Card variant="soft">
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 12 }}>Urges you faced</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chart}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: t.muted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${t.border}`, fontSize: 12 }} cursor={{ fill: t.bgTint }} />
                <Bar dataKey="urges" fill={t.accent} radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: 12, color: t.muted, marginTop: 10, lineHeight: 1.5 }}>
              Every urge here is one you faced — not gave in to. That&apos;s the whole point.
            </p>
          </Card>
        </>
      )}

      <BottomNav />
    </div>
  );
}
