"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Splash } from "@/components/Splash";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PostRelapseFlow } from "@/components/PostRelapseFlow";
import { Modal } from "@/components/Modal";
import { Card } from "@/components/ui/Card";
import { RecoveryOrb } from "@/components/ui/RecoveryOrb";
import { deriveInsight } from "@/lib/insights";
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


function HomeScreen({
  streak,
  longestStreak,
  momentum,
  score,
  insight,
  onJournalTap,
  onRelapseTap,
}: {
  streak: number;
  longestStreak: number;
  momentum: string;
  score: number;
  insight: string;
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
            <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>
              {greeting()} 👋
            </div>
            <div style={{ fontSize: 13, color: t.accent, fontWeight: 600, marginTop: 2 }}>
              Day {streak} of your reset
            </div>
          </div>
        </header>
      </Reveal>

      {/* ── HERO: compact orb + stats side-by-side (≈28% of screen) ── */}
      <Reveal index={1}>
        <div
          className="mesh pearl"
          style={{
            borderRadius: 32,
            padding: "22px 22px",
            marginBottom: 14,
            boxShadow: t.shadowAccent,
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, backgroundImage: "url('/hero/home.webp')",
              backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "screen",
              opacity: 0.45, borderRadius: 32, pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
            <RecoveryOrb score={score} size={128} label="" />
          </div>
          <div style={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>How you&apos;re doing</div>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, marginTop: 4 }}>{momentum}</div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 7, marginTop: 12,
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
        </div>
      </Reveal>

      {/* ── PRIMARY ACTION: calm mode (right under the hero) ── */}
      <Reveal index={2}>
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
      <Reveal index={3}>
        <Card variant="soft" style={{ marginBottom: 16, borderLeft: `3px solid ${t.accent2}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: t.gradHero, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }} aria-hidden>✦</span>
            <span style={{ fontSize: 11, color: t.accent2, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>What we noticed</span>
          </div>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>{insight}</p>
        </Card>
      </Reveal>

      {/* ── TODAY'S FOCUS (real habits) ── */}
      <Reveal index={4}>
        <Card variant="soft" onClick={() => {}} ariaLabel="Today's focus" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Today&apos;s focus</div>
            <Link href="/habits" style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>See all →</Link>
          </div>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>
            Small steps today. Check off a habit or write a quick note — one thing is enough.
          </p>
        </Card>
      </Reveal>

      {/* ── DAILY REFLECTION ── */}
      <Reveal index={5}>
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
  const [showSplash, setShowSplash] = useState(true);

  const streak = user?.streak ?? 0;
  const longestStreak = user?.longestStreak ?? 0;
  const score = user?.disciplineScore ?? 0;
  const momentum = user?.momentum ?? "Getting started";

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    }
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
      <AnimatePresence>{showSplash && <Splash onDone={() => setShowSplash(false)} />}</AnimatePresence>
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingComplete} />}
      {showPostRelapse && <PostRelapseFlow onComplete={handleRelapseComplete} previousStreak={streak} />}

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
          longestStreak={longestStreak}
          momentum={momentum}
          score={score}
          insight={deriveInsight(user?.logs, user?.triggerPatterns)}
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
