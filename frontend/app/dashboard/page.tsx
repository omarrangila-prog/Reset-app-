"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppStore } from "../../lib/store";
import { api } from "../../lib/api";
import { StreakCard } from "../../components/StreakCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { LoadingState } from "../../components/LoadingState";
import { BottomNav } from "@/components/ui/BottomNav";
import { SkeletonCard, SkeletonOrb } from "@/components/ui/Skeleton";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Analytics {
  streak: number;
  longestStreak: number;
  totalUrges: number;
  totalRelapses: number;
  triggerPatterns: Array<{ id: string; type: string; frequency: number; lastSeen: string }>;
  dailyActivity: Array<{ date: string; urges: number; successes: number; relapses: number }>;
}

const triggerLabels: Record<string, string> = {
  BOREDOM: "Boredom",
  STRESS: "Stress",
  LONELINESS: "Loneliness",
  ANXIETY: "Anxiety",
  ANGER: "Anger",
  SADNESS: "Sadness",
  LATE_NIGHT: "Late Night",
  IDLE_TIME: "Idle Time",
  SOCIAL_REJECTION: "Social Rejection",
};

export default function DashboardPage() {
  const { userId, user, setUser } = useAppStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakLoading, setStreakLoading] = useState(false);

  const [loadError, setLoadError] = useState(false);

  const refresh = async () => {
    const me = await api.getMe();
    setUser(me);
    setAnalytics({
      streak: me.streak,
      longestStreak: me.longestStreak,
      totalUrges: me.totalUrges,
      totalRelapses: me.totalRelapses,
      triggerPatterns: me.triggerPatterns,
      dailyActivity: me.dailyActivity,
    });
  };

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      // Wait until the device session is established.
      if (!userId) return;
      try {
        await refresh();
        if (!cancelled) setLoadError(false);
      } catch (e) {
        // Never show fabricated data — surface an honest error instead.
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) return;
    setStreakLoading(true);
    try {
      await api.checkIn();
      await refresh();
    } catch (e) {
      setLoadError(true);
    } finally {
      setStreakLoading(false);
    }
  };

  const handleResetStreak = async () => {
    if (!userId) return;
    if (!confirm("Log a relapse? Your streak restarts at day 1 — no shame, no penalty.")) return;
    setStreakLoading(true);
    try {
      await api.logRelapse();
      await refresh();
    } catch (e) {
      setLoadError(true);
    } finally {
      setStreakLoading(false);
    }
  };

  // Format daily activity for chart (last 14 days)
  const chartData = analytics?.dailyActivity
    .slice(-14)
    .map((d) => ({
      day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
      urges: d.urges,
      wins: d.successes,
    })) || [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto", padding: "24px 24px 120px" }}>
        <SkeletonOrb size={120} />
        <div style={{ height: 24 }} />
        <SkeletonCard lines={2} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><SkeletonCard lines={1} /></div>
          <div style={{ flex: 1 }}><SkeletonCard lines={1} /></div>
        </div>
        <SkeletonCard lines={3} />
        <BottomNav />
      </div>
    );
  }

  if (loadError || !analytics) {
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          color: "#1C2333",
        }}
      >
        <p style={{ fontSize: 16 }}>We couldn&apos;t load your data just now.</p>
        <p style={{ fontSize: 13, color: "#9A9AA0" }}>
          Your progress is safe. Check your connection and try again.
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setLoadError(false);
            refresh()
              .catch(() => setLoadError(true))
              .finally(() => setLoading(false));
          }}
          style={{
            padding: "12px 20px",
            background: "#2FBE6E",
            color: "#000",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const data = analytics;

  return (
    <div style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto", padding: "0 24px 120px" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
          marginBottom: "8px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "20px",
              letterSpacing: "0.1em",
              color: "#1C2333",
            }}
          >
            RESET
          </Link>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "#8A93A6",
              marginTop: "2px",
            }}
          >
            Dashboard
          </div>
        </div>

        <Link href="/coach?mode=URGE&urgency=8">
          <Button variant="danger" size="sm">
            I Need Help Now
          </Button>
        </Link>
      </header>

      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        <Link href="/analytics" style={{ flex: 1, textAlign: "center", padding: "12px", background: "#FFFFFF", border: "1px solid #E6EAF2", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#5B7CFA", minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          See what&apos;s helping
        </Link>
        <Link href="/achievements" style={{ flex: 1, textAlign: "center", padding: "12px", background: "#FFFFFF", border: "1px solid #E6EAF2", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#5B7CFA", minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          Achievements
        </Link>
      </div>

      {/* Streak card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ margin: "24px 0" }}
      >
        <StreakCard
          streak={user?.streak ?? data.streak}
          longestStreak={user?.longestStreak ?? data.longestStreak}
        />

        {/* Streak controls */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            loading={streakLoading}
            onClick={handleCheckIn}
            style={{ flex: 1 }}
          >
            ✓ Check in for today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={streakLoading}
            onClick={handleResetStreak}
            style={{ color: "#EC6A5E" }}
          >
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          label="Total Urges Faced"
          value={data.totalUrges}
          sublabel="You faced each one"
          color="#5B7CFA"
        />
        <StatCard
          label="Relapses"
          value={data.totalRelapses}
          sublabel={data.totalRelapses === 0 ? "Clean record" : "Each one taught you"}
          color={data.totalRelapses === 0 ? "#2FBE6E" : "#EC6A5E"}
        />
      </motion.div>

      {/* Activity chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: "24px" }}
        >
          <Card variant="default" padding="md">
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A93A6",
                marginBottom: "20px",
              }}
            >
              14-Day Activity
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barGap={2}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#8A93A6", fontFamily: "var(--font-body)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E6EAF2",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                    color: "#1C2333",
                  }}
                />
                <Bar dataKey="urges" name="Urges" fill="#EC6A5E55" radius={[3, 3, 0, 0]} />
                <Bar dataKey="wins" name="Wins" fill="#2FBE6E88" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <Legend color="#EC6A5E55" label="Urges" />
              <Legend color="#2FBE6E88" label="Wins" />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Trigger patterns */}
      {data.triggerPatterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: "24px" }}
        >
          <Card variant="default" padding="md">
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A93A6",
                marginBottom: "20px",
              }}
            >
              Your Trigger Patterns
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.triggerPatterns.slice(0, 5).map((tp, i) => {
                const maxFreq = data.triggerPatterns[0]?.frequency || 1;
                const pct = Math.round((tp.frequency / maxFreq) * 100);
                return (
                  <div key={tp.id || i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          color: "#1C2333",
                        }}
                      >
                        {triggerLabels[tp.type] || tp.type}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "#8A93A6",
                        }}
                      >
                        {tp.frequency}×
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "var(--r-full)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          background: i === 0 ? "#EC6A5E" : i === 1 ? "#5B7CFA" : "#8A93A6",
                          borderRadius: "var(--r-full)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Weekly summary */}
      {user?.weeklyStats && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="bordered" padding="md">
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A93A6",
                marginBottom: "16px",
              }}
            >
              This Week
            </div>
            <div style={{ display: "flex", gap: "32px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#5B7CFA" }}>
                  {user.weeklyStats.urges}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#8A93A6" }}>
                  urges faced
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#2FBE6E" }}>
                  {user.weeklyStats.successes}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#8A93A6" }}>
                  wins
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "28px", color: "#EC6A5E" }}>
                  {user.weeklyStats.relapses}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#8A93A6" }}>
                  relapses
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      <BottomNav />
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: number;
  sublabel: string;
  color: string;
}) {
  return (
    <Card variant="default" padding="md">
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A93A6",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "40px",
          color,
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          color: "#8A93A6",
        }}
      >
        {sublabel}
      </div>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "2px",
          background: color,
        }}
      />
      <span style={{ fontSize: "12px", color: "#8A93A6", fontFamily: "var(--font-body)" }}>
        {label}
      </span>
    </div>
  );
}
