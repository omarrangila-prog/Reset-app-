"use client";

import Link from "next/link";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Splash } from "@/components/Splash";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PostRelapseFlow } from "@/components/PostRelapseFlow";
import { Modal } from "@/components/Modal";
import { Card } from "@/components/ui/Card";
import { RecoveryOrb } from "@/components/ui/RecoveryOrb";
import { deriveInsight } from "@/lib/insights";
import { deriveReflection } from "@/lib/reflection";
import { loadProfile, deriveRecovery, deriveBriefing, deriveForecast, DEFAULT_PROFILE, Briefing, RiskLevel, Forecast } from "@/lib/recoveryProfile";
import { deriveHomeHero, HomeHero } from "@/lib/homeHero";
import { setMood } from "@/components/ui/Atmosphere";
import { Sun, Cloud, Moon, CloudRain } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Rest well tonight";
}

function ForecastIcon({ icon }: { icon: Forecast["icon"] }) {
  const Icon = icon === "sun" ? Sun : icon === "cloud" ? Cloud : icon === "rain" ? CloudRain : Moon;
  return (
    <span aria-hidden style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)", color: "var(--accent)", boxShadow: "inset 1px 1px 0 var(--neu-light), inset -2px -2px 5px var(--neu-dark)" }}>
      <Icon size={17} />
    </span>
  );
}

function RiskChip({ risk }: { risk: RiskLevel }) {
  const map: Record<RiskLevel, { label: string; color: string; bg: string }> = {
    low: { label: "Low risk now", color: "var(--recovery)", bg: "color-mix(in srgb, var(--recovery) 14%, transparent)" },
    moderate: { label: "Stay mindful", color: "var(--vuln)", bg: "color-mix(in srgb, var(--vuln) 16%, transparent)" },
    elevated: { label: "Higher-risk time", color: "var(--urge)", bg: "color-mix(in srgb, var(--urge) 16%, transparent)" },
  };
  const m = map[risk];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, borderRadius: 999, padding: "3px 9px" }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} /> {m.label}
    </span>
  );
}

// Status read as words, so the orb isn't carrying a bare number.
function scoreState(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Improving";
  if (score >= 40) return "Building";
  return "Getting started";
}
function scoreHeadline(score: number): string {
  if (score >= 80) return "You’ve stayed steady through difficult moments.";
  if (score >= 60) return "Recovery is becoming more stable.";
  if (score >= 40) return "You’re building something that lasts.";
  return "Every reset starts with showing up.";
}


function HomeScreen({
  streak,
  momentum,
  score,
  insight,
  reflection,
  focus,
  briefing,
  hero,
  forecast,
  onJournalTap,
  onRelapseTap,
}: {
  streak: number;
  momentum: string;
  score: number;
  insight: string;
  reflection: string;
  focus: string;
  briefing: Briefing | null;
  hero: HomeHero | null;
  forecast: Forecast | null;
  onJournalTap: () => void;
  onRelapseTap: () => void;
}) {
  const prompts = [
    "What are you proud of today?",
    "What did you handle well?",
    "What brought you a moment of calm?",
    "What did you learn about yourself?",
    "What are you grateful for right now?",
  ];
  const daySeed = new Date().toISOString().split("T")[0].split("-").reduce((a, b) => a + Number(b), 0);
  const prompt = prompts[daySeed % prompts.length];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      {/* Dynamic header — greeting + day of recovery */}
      <Reveal index={0}>
        <header style={{ marginBottom: 20, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div suppressHydrationWarning style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>
              {greeting()} 👋
            </div>
            <div style={{ fontSize: 13, color: t.accent, fontWeight: 600, marginTop: 2 }}>
              Day {streak} of your reset
            </div>
          </div>
        </header>
      </Reveal>

      {/* ── DAILY BRIEFING: dynamic hero + recovery forecast + quote ── */}
      <Reveal index={1}>
        {briefing && hero && forecast ? (
        <div className="frost" style={{ borderRadius: 20, padding: "18px 18px", marginBottom: 14, border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{briefing.greeting}</span>
            <RiskChip risk={briefing.risk} />
          </div>
          <p style={{ fontSize: 16, color: t.text, lineHeight: 1.5, fontWeight: 600, margin: "0 0 10px" }}>{hero.line}</p>

          {/* Recovery forecast — weather-like guidance */}
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "11px 13px", borderRadius: 14, background: "var(--accent-soft)", border: `1px solid ${t.border}`, marginBottom: 12 }}>
            <ForecastIcon icon={forecast.icon} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: t.text }}>{forecast.period} · {forecast.label}</div>
              <div style={{ fontSize: 12.5, color: t.sub, marginTop: 2, lineHeight: 1.45 }}>{forecast.recommendation}</div>
            </div>
          </div>

          {/* Contextual quote */}
          <p style={{ fontSize: 13, color: t.sub, lineHeight: 1.55, fontStyle: "italic", margin: "0 0 12px", paddingLeft: 12, borderLeft: `2px solid ${t.accent}` }}>{hero.quote}</p>

          <Link href={briefing.nextAction.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999, background: "var(--grad-hero)", color: "#fff", fontSize: 13, fontWeight: 600, minHeight: 40, boxShadow: "var(--shadow-accent)" }}>
            {briefing.nextAction.label} →
          </Link>
        </div>
        ) : (
          <div className="frost" style={{ borderRadius: 20, padding: "18px 18px", marginBottom: 14, border: `1px solid ${t.border}`, minHeight: 120 }} aria-hidden />
        )}
      </Reveal>

      {/* ── HERO: one focal Recovery Orb; score presented outside it ── */}
      <Reveal index={2}>
        <div
          className="mesh pearl"
          style={{
            borderRadius: 32,
            padding: "26px 22px 28px",
            marginBottom: 14,
            boxShadow: t.shadowAccent,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, fontSize: 12, color: "rgba(255,255,255,0.82)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            How are you doing?
          </div>
          <div style={{ position: "relative", zIndex: 1, fontSize: 15, color: "#fff", fontWeight: 500, marginTop: 6, marginBottom: 6, maxWidth: 300, lineHeight: 1.5 }}>
            {scoreHeadline(score)}
          </div>

          <div style={{ position: "relative", zIndex: 1, margin: "6px 0 2px" }}>
            <RecoveryOrb size={150} />
          </div>

          {/* Score — outside the orb, as supporting information */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span style={{ fontFamily: t.fontHeading, fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>· {scoreState(score)}</span>
          </div>
          <div style={{ position: "relative", zIndex: 1, fontSize: 12.5, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>{momentum}</div>

          <div
            style={{
              position: "relative", zIndex: 1,
              display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14,
              padding: "8px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.32)",
              color: "#fff", fontSize: 13, fontWeight: 600,
            }}
          >
            <span aria-hidden>🔥</span>
            {streak} day streak
          </div>
        </div>
      </Reveal>

      {/* ── PRIMARY ACTION: calm mode (right under the hero) ── */}
      <Reveal index={3}>
        <Link
          href="/urge"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: "100%",
            padding: "18px 24px", background: t.gradHero, borderRadius: 18, color: "#fff",
            fontSize: 15, fontWeight: 600, marginBottom: 16, minHeight: 56,
            boxShadow: t.shadowAccent, letterSpacing: "0.01em",
          }}
        >
          Feeling an urge? Open calm mode
        </Link>
      </Reveal>

      {/* ── AI INSIGHT (real, from your data) ── */}
      <Reveal index={4}>
        <Card variant="soft" style={{ marginBottom: 16, borderLeft: `3px solid ${t.accent2}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: t.gradHero, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }} aria-hidden>✦</span>
            <span style={{ fontSize: 11, color: t.accent2, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>What we noticed</span>
          </div>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>{insight}</p>
        </Card>
      </Reveal>

      {/* ── TODAY'S FOCUS (real habits) ── */}
      <Reveal index={5}>
        <Card variant="soft" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Today&apos;s focus</div>
            <Link href="/habits" style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>See all →</Link>
          </div>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>
            {focus}
          </p>
        </Card>
      </Reveal>

      {/* ── DAILY REFLECTION PROMPT ── */}
      <Reveal index={6}>
        <Card variant="soft" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Take a moment
          </div>
          <p style={{ fontSize: 15, color: t.text, marginBottom: 14, lineHeight: 1.6 }}>{prompt}</p>
          <button
            onClick={onJournalTap}
            style={{
              width: "100%", padding: "12px 16px", background: t.accentSoft, border: "none",
              borderRadius: 12, color: t.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44,
            }}
          >
            Write today&apos;s note →
          </button>
        </Card>
      </Reveal>

      <button
        onClick={onRelapseTap}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          color: t.sub,
          fontSize: 13,
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        I slipped — start again, gently
      </button>
    </div>
  );
}


export default function HomeApp() {
  const { user, authReady, userId, setUser } = useAppStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPostRelapse, setShowPostRelapse] = useState(false);
  const [journal, setJournal] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  // Splash shows once per *session* (fresh launch/reopen), NOT on internal
  // navigation back to Home. sessionStorage is cleared when the tab/PWA is fully
  // closed, so a fresh launch gets a fresh session and the splash replays.
  // Start false during SSR; a layout effect decides synchronously before paint.
  const [showSplash, setShowSplash] = useState(false);

  const streak = user?.streak ?? 0;
  const score = user?.disciplineScore ?? 0;
  const momentum = user?.momentum ?? "Getting started";

  // Personalized "Today's focus" from the Recovery Profile (falls back to the
  // gentle default when the user hasn't personalized yet — non-breaking).
  const [homeFocus, setHomeFocus] = useState(
    "Small steps today. Check off a habit or write a quick note — one thing is enough."
  );
  // Time-of-day dependent values are computed client-side (in effects) to avoid
  // SSR/client hydration mismatches (the server hour can differ from the client).
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [hero, setHero] = useState<HomeHero | null>(null);
  useEffect(() => {
    const p = loadProfile();
    setBriefing(deriveBriefing(p));
    setForecast(deriveForecast(p));
    if (p.onboardingCompleted && (p.triggers.length || p.highRiskTimes.length || p.locations.length)) {
      setHomeFocus(deriveRecovery(p).firstStep);
    }
    const recentLapse = (user?.dailyActivity ?? []).slice(-2).some((d) => d.relapses > 0);
    const hitMilestone = [3, 7, 14, 30].includes(user?.streak ?? 0);
    setHero(deriveHomeHero({ streak: user?.streak ?? 0, hadRecentLapse: recentLapse, hitMilestone }));
    // Living background mood: difficult after a recent lapse, progress at a
    // milestone / healthy streak, else calm.
    setMood(recentLapse ? "difficult" : hitMilestone || (user?.streak ?? 0) >= 7 ? "progress" : "calm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.streak]);

  // Decide splash before first paint: show once per session (fresh launch),
  // not on internal navigation back to Home. Independent of onboarding.
  useLayoutEffect(() => {
    if (sessionStorage.getItem("reset_splash_seen") !== "true") {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    }
  }, []);

  // Show the splash on every *fresh* launch, not only first install. A PWA that
  // resumes from the background (or a bfcache restore) does not re-mount, so we
  // re-trigger the splash when the app returns to the foreground after being
  // hidden for a while — which is what relaunching a closed PWA looks like.
  useEffect(() => {
    let hiddenAt = 0;
    const RELAUNCH_MS = 60_000; // treat >60s backgrounded as a fresh launch
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible" && hiddenAt) {
        if (Date.now() - hiddenAt > RELAUNCH_MS) {
          sessionStorage.removeItem("reset_splash_seen");
          setShowSplash(true);
        }
        hiddenAt = 0;
      }
    };
    // bfcache restore (PWA reopen) fires pageshow with persisted=true.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) { sessionStorage.removeItem("reset_splash_seen"); setShowSplash(true); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    try {
      setUser(await api.getMe());
    } catch {
      /* non-fatal */
    }
  }, [userId, setUser]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboarding_seen", "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const handleSaveJournal = async () => {
    const content = journal.trim();
    if (!content) {
      setShowJournalModal(false);
      return;
    }
    setJournalSaving(true);
    try {
      await api.createJournal(content);
      setJournal("");
      setJournalSaved(true);
      setShowJournalModal(false);
      setTimeout(() => setJournalSaved(false), 3000);
    } catch {
      alert("Couldn't save just now — your note is still here. Try again in a moment.");
    } finally {
      setJournalSaving(false);
    }
  };

  const handleRelapseComplete = async () => {
    setShowPostRelapse(false);
    await refreshUser();
  };

  return (
    <div style={{ minHeight: "100vh", color: t.text }}>
      <AnimatePresence>{showSplash && <Splash onDone={() => { sessionStorage.setItem("reset_splash_seen", "true"); setShowSplash(false); }} />}</AnimatePresence>
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingComplete} />}
      {showPostRelapse && <PostRelapseFlow onComplete={handleRelapseComplete} />}

      <Modal open={showJournalModal} onClose={() => setShowJournalModal(false)} title="What's on your mind?" align="bottom">
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.currentTarget.value.slice(0, 5000))}
          placeholder="Write freely. Your notes are encrypted and private."
          aria-label="Journal entry"
          autoFocus
          style={{
            width: "100%",
            padding: 14,
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            color: t.text,
            fontFamily: t.fontBody,
            fontSize: 14,
            outline: "none",
            resize: "none",
            minHeight: 200,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontSize: 11, color: t.muted, marginBottom: 12 }}>{journal.length} / 5000</div>
        <button
          onClick={handleSaveJournal}
          disabled={journalSaving}
          style={{
            width: "100%",
            padding: "14px 18px",
            background: t.gradHero,
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: journalSaving ? "default" : "pointer",
            marginBottom: 8,
            minHeight: 48,
            opacity: journalSaving ? 0.7 : 1,
          }}
        >
          {journalSaving ? "Saving…" : "Save note"}
        </button>
        <button
          onClick={() => setShowJournalModal(false)}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "transparent",
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            color: t.sub,
            fontSize: 13,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Cancel
        </button>
      </Modal>

      {/* Top bar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <div style={{ fontFamily: t.fontHeading, fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 22, height: 22, borderRadius: 7, background: t.gradHero, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }} aria-hidden>◆</span>
          RESET
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/urge"
            aria-label="Get crisis help"
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 12,
              background: `${t.urge}14`,
              border: `1px solid ${t.urge}33`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: t.urge,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            🆘 Help
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: t.surface,
              border: `1px solid ${t.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.sub,
              boxShadow: t.shadowSm,
            }}
          >
            ⚙
          </Link>
        </div>
      </nav>

      {journalSaved && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 64,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: t.emerald,
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: t.shadowMd,
          }}
        >
          Note saved securely ✓
        </div>
      )}

      {hasSeenOnboarding && (
        <HomeScreen
          streak={streak}
          momentum={momentum}
          score={score}
          insight={deriveInsight(user?.logs, user?.triggerPatterns)}
          reflection={deriveReflection(user?.logs, user?.dailyActivity, streak)}
          focus={homeFocus}
          briefing={briefing}
          hero={hero}
          forecast={forecast}
          onJournalTap={() => setShowJournalModal(true)}
          onRelapseTap={() => setShowPostRelapse(true)}
        />
      )}

      {!authReady && (
        <div aria-hidden style={{ position: "fixed", bottom: 90, left: 0, right: 0, textAlign: "center", fontSize: 11, color: t.muted }}>
          Securing your private space…
        </div>
      )}

      <BottomNav />
    </div>
  );
}
