"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppStore } from "../../lib/store";
import { api } from "../../lib/api";
import { BottomNav } from "@/components/ui/BottomNav";
import { SkeletonCard, SkeletonOrb } from "@/components/ui/Skeleton";
import Link from "next/link";
import { RecoveryChart } from "@/components/ui/RecoveryChart";
import { DEMO_ANALYTICS, hasUsefulAnalytics } from "@/lib/demoInsights";
import { deriveTriggerDiscovery } from "@/lib/recoveryMetrics";

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
  // True when we're showing seeded sample data instead of the user's own.
  const [isDemo, setIsDemo] = useState(false);

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
    setIsDemo(false);
    return me;
  };

  useEffect(() => {
    let cancelled = false;
    // Skeleton can never persist: after 2.5s we fall back to sample insights so
    // the tab always shows meaningful content (covers auth that never resolves,
    // a hung request, or a session that never establishes).
    const fallback = setTimeout(() => {
      if (cancelled) return;
      setAnalytics((prev) => {
        if (prev) return prev; // real data already arrived
        setIsDemo(true);
        return DEMO_ANALYTICS;
      });
      setLoading(false);
    }, 2500);

    async function loadData() {
      try {
        // No session yet → show sample insights rather than hang forever.
        if (!userId) {
          if (!cancelled) {
            setAnalytics(DEMO_ANALYTICS);
            setIsDemo(true);
          }
          return;
        }
        const me = await refresh();
        if (!cancelled) {
          if (!hasUsefulAnalytics(me)) {
            // Session exists but no real activity yet — seed a sample so the
            // page teaches what Insights will look like.
            setAnalytics(DEMO_ANALYTICS);
            setIsDemo(true);
          }
          setLoadError(false);
        }
      } catch {
        // API failed — prefer sample data over a dead-end error screen.
        if (!cancelled) {
          setAnalytics(DEMO_ANALYTICS);
          setIsDemo(true);
          setLoadError(false);
        }
      } finally {
        if (!cancelled) {
          clearTimeout(fallback);
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      cancelled = true;
      clearTimeout(fallback);
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
          color: "var(--text)",
        }}
      >
        <p style={{ fontSize: 16 }}>We couldn&apos;t load your data just now.</p>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
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
  const discovery = deriveTriggerDiscovery(user?.logs, data.triggerPatterns);
  const wins = data.dailyActivity.reduce((s, d) => s + d.successes, 0);
  const urges = data.dailyActivity.reduce((s, d) => s + d.urges, 0);

  return (
    <div style={{ minHeight: "100vh", maxWidth: 560, margin: "0 auto", padding: "24px 22px 130px", position: "relative", zIndex: 1 }}>
      {/* Editorial masthead — typography-led, no "dashboard" chrome */}
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 32, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>Your progress</div>
          {isDemo && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", background: "var(--accent-soft)", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>
              Sample insights
            </span>
          )}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.035em", lineHeight: 1.02, marginTop: 8 }}>
          Look how far<br />you&apos;ve come.
        </h1>
      </motion.header>

      {/* Hero narrative stat — one sentence, not a KPI grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 19, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }}>
          Over two weeks you faced{" "}
          <span style={{ color: "#5B7CFA", fontWeight: 700 }}>{urges} urges</span> and got through{" "}
          <span style={{ color: "#2FBE6E", fontWeight: 700 }}>{wins}</span> of them.
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>That&apos;s not luck. That&apos;s you showing up.</div>
      </motion.div>

      {/* Chart as a calm, wide hero (asymmetric, no card chrome) */}
      {chartData.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 18 }}>Last 14 days</div>
          <RecoveryChart data={chartData} />
          <div style={{ display: "flex", gap: 18, marginTop: 12, paddingLeft: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-sub)" }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--recovery)" }} /> Got through</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-sub)" }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)" }} /> Difficult moments</span>
          </div>
        </motion.section>
      )}

      {/* Check-in — the one primary action, framed warmly */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 22, background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(46,62,120,0.07), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Been on track today?</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>A quick check-in keeps your thread alive.</div>
          </div>
          <button onClick={handleCheckIn} disabled={streakLoading} style={{ padding: "12px 20px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#6E8CFB,#9B7BF2)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44, boxShadow: "0 10px 24px rgba(91,124,250,0.28)" }}>
            {streakLoading ? "…" : "Check in"}
          </button>
        </div>
        <button onClick={handleResetStreak} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
          I slipped — start again, gently
        </button>
      </motion.section>

      {/* Trigger insight as one editorial line + soft link, not a bar list */}
      {data.triggerPatterns.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>What we&apos;ve noticed</div>
          <p style={{ fontSize: 17, color: "var(--text)", lineHeight: 1.55, fontWeight: 500 }}>
            Your urges lean toward <span style={{ color: "#5B7CFA", fontWeight: 700 }}>{triggerLabels[data.triggerPatterns[0].type] || "certain moments"}</span>.
          </p>
          <Link href="/journey/triggers" style={{ display: "inline-block", marginTop: 10, color: "var(--accent-text)", fontSize: 14, fontWeight: 600 }}>See your patterns →</Link>
        </motion.section>
      )}

      {/* AI observations — the intelligence layer. Derived where possible,
          otherwise gently seeded so the page is never thin. */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.5 }} style={{ marginTop: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg,#6E8CFB,#9B7BF2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }} aria-hidden>✦</span>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-text)" }}>What we&apos;ve learned</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { emoji: "🌙", text: "Your hardest moments cluster late at night. Winding down a little earlier could take the edge off." },
            { emoji: "🚶", text: "You got through more urges on days you moved your body — a short walk seems to help you most." },
            { emoji: "✍️", text: "Your mood tends to lift after you journal. Even a sentence seems to settle things." },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "16px", borderRadius: 18, background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "0 4px 14px rgba(46,62,120,0.05)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }} aria-hidden>{c.emoji}</span>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.55 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* One recommended next step */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.5 }} style={{ marginTop: 28 }}>
        <div style={{ background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: "1px solid var(--border)", borderRadius: 22, padding: 20, boxShadow: "var(--shadow-card, var(--shadow-sm))" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 6 }}>Try this next</div>
          <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.55, fontWeight: 500, marginBottom: 14 }}>
            Set a gentle wind-down reminder for the evening — your calmest days start with earlier nights.
          </p>
          <Link href="/profile/notifications" style={{ display: "inline-flex", padding: "11px 20px", background: "linear-gradient(135deg,#6E8CFB,#9B7BF2)", color: "#fff", borderRadius: 999, fontSize: 14, fontWeight: 600, minHeight: 44, alignItems: "center", boxShadow: "0 10px 24px rgba(91,124,250,0.28)" }}>
            Set a reminder
          </Link>
        </div>
      </motion.section>

      {/* Trigger Discovery — patterns behind difficult moments */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.5 }} style={{ marginTop: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>What we&apos;re noticing</div>
          {!discovery.hasRealData && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", background: "var(--accent-soft)", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>Sample</span>
          )}
        </div>
        <p style={{ fontSize: 14, color: "var(--text-sub)", lineHeight: 1.55, marginBottom: 18 }}>Patterns build up as you check in — private to you.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <DiscoveryTile label="Hardest time" value={discovery.hardestTime} />
          <DiscoveryTile label="Strongest emotion" value={discovery.strongestEmotion} />
          <DiscoveryTile label="Most successful response" value={discovery.bestResponse} />
          <DiscoveryTile label="Longest difficult moment survived" value={`${discovery.longestUrgeMinutes} min`} />
          <DiscoveryTile label="Most successful day" value={discovery.bestDay} />
          <DiscoveryTile label="Highest-risk day" value={discovery.riskiestDay} />
        </div>
      </motion.section>

      {/* Recovery factors — what shapes your recovery, explained */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} style={{ marginTop: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>What shapes your recovery</div>
        <p style={{ fontSize: 14, color: "var(--text-sub)", lineHeight: 1.55, marginBottom: 18 }}>
          A few gentle habits move the needle most. Tap any to see why.
        </p>
        <RecoveryFactors data={data} logs={user?.logs} />
      </motion.section>

      <BottomNav />
    </div>
  );
}

function DiscoveryTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 15px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.35, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function RecoveryFactors({ data, logs }: { data: Analytics; logs?: any[] }) {
  const checkins = (logs ?? []).filter((l: any) => l.type === "CHECK_IN").length;
  const successes = (logs ?? []).filter((l: any) => l.type === "SUCCESS").length;

  // Simple, honest signals — "strong / building / worth attention".
  const factors = [
    {
      key: "mood",
      name: "Noticing how you feel",
      color: "#5B7CFA",
      level: checkins >= 5 ? "Strong" : checkins > 0 ? "Building" : "Just starting",
      why: "Catching a feeling early gives you a moment to choose what happens next.",
      how: "Check in on the Mood screen once a day — even a quick tap counts.",
      href: "/journey/mood",
    },
    {
      key: "urge",
      name: "Riding out urges",
      color: "#7C6BF0",
      level: data.totalUrges > 0 ? "Building" : "Just starting",
      why: "Every urge you sit with instead of acting on makes the next one weaker.",
      how: "When one hits, open Calm Mode and breathe until it passes.",
      href: "/urge",
    },
    {
      key: "sleep",
      name: "Getting enough rest",
      color: "#4FB6F5",
      level: "Worth attention",
      why: "Tired brains reach harder for quick escapes, so urges feel stronger.",
      how: "Aim to be in bed a little earlier — even 20 minutes helps.",
      href: "/profile/goals",
    },
    {
      key: "journal",
      name: "Writing things down",
      color: "#34C9A3",
      level: "Building",
      why: "Putting a feeling into words takes away some of its grip.",
      how: "Write one honest sentence in your journal tonight.",
      href: "/journey/journal",
    },
    {
      key: "habits",
      name: "Small daily habits",
      color: "#F0B24B",
      level: successes >= 5 ? "Strong" : "Building",
      why: "Steady routines give hard moments something better to fall back on.",
      how: "Keep one small habit going — a short walk, an earlier night.",
      href: "/habits",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {factors.map((f, i) => (
        <FactorRow key={f.key} f={f} index={i} />
      ))}
    </div>
  );
}

function FactorRow({ f, index }: { f: any; index: number }) {
  const [open, setOpen] = useState(false);
  // AA-safe level pill: white text needs a deep-enough fill (>4.5:1).
  const levelTint = f.level === "Strong" ? "#127A44" : f.level === "Building" ? "#5B4FC4" : "#5A6478";
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 14px rgba(46,62,120,0.05)" }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", minHeight: 44 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: f.color, flexShrink: 0 }} aria-hidden />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{f.name}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: levelTint, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>{f.level}</span>
        <span style={{ color: "var(--text-muted)", fontSize: 15, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} aria-hidden>›</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px 38px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 3 }}>Why it matters</div>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{f.why}</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 3 }}>One way to grow it</div>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{f.how}</p>
          </div>
          <Link href={f.href} style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-text)", marginTop: 2 }}>Do this now →</Link>
        </div>
      )}
    </motion.div>
  );
}
