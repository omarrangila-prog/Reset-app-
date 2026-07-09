"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PostRelapseFlow } from "@/components/PostRelapseFlow";
import { Modal } from "@/components/Modal";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

const T = {
  bg: "#141413",
  bgSurface: "#1A1A18",
  text: "#EDEDEB",
  // Raised from the old #7A7A80 / #3A3A40 to meet WCAG AA contrast on #141413.
  textSub: "#A7A7AD",
  textMuted: "#8A8A90",
  border: "#2C2C34",
  recovery: "#2FBE6E",
  amber: "#E0B486",
  urge: "#E8352C",
};

function HomeScreen({
  streak,
  longestStreak,
  onJournalTap,
  onRelapseTap,
}: {
  streak: number;
  longestStreak: number;
  onJournalTap: () => void;
  onRelapseTap: () => void;
}) {
  const [intention, setIntention] = useState("");
  const [showIntentionPicker, setShowIntentionPicker] = useState(false);

  const defaultIntentions = ["Present", "Patient", "Strong", "Calm", "Clear", "Brave", "Kind", "Focused"];

  // Stable daily prompt (does not change on re-render): seeded by the date.
  const reflectionPrompts = [
    "What are you proud of today?",
    "What triggered you most?",
    "How did you handle difficulty?",
    "What brought you joy?",
    "What did you learn?",
  ];
  const daySeed = new Date().toISOString().split("T")[0].split("-").reduce((a, b) => a + Number(b), 0);
  const dailyPrompt = reflectionPrompts[daySeed % reflectionPrompts.length];

  return (
    <div
      style={{
        padding: "24px",
        paddingTop: "80px",
        paddingBottom: "120px",
        maxWidth: 520,
        margin: "0 auto",
        background: T.bg,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
          padding: "32px 24px",
          background: `linear-gradient(135deg, rgba(47, 190, 110, 0.08) 0%, rgba(224, 180, 134, 0.04) 100%)`,
          borderRadius: 16,
          border: `1px solid ${T.recovery}22`,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            letterSpacing: "0.1em",
            color: T.textMuted,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Current Streak
        </div>
        <div
          aria-live="polite"
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: 64,
            color: T.recovery,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}
        >
          {streak}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: T.amber, fontWeight: 500 }}>
          {streak === 0 ? "A fresh start begins now." : `Day ${streak}. You're doing this.`}
        </div>
        {longestStreak > streak && (
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.textMuted, marginTop: 8 }}>
            Your longest streak: {longestStreak} days
          </div>
        )}
      </div>

      <Link
        href="/urge"
        style={{
          display: "inline-flex",
          width: "100%",
          padding: "18px 24px",
          background: T.amber,
          border: "none",
          borderRadius: 12,
          color: "#080809",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 16,
          minHeight: 44,
          letterSpacing: "0.02em",
          justifyContent: "center",
          textDecoration: "none",
        }}
      >
        Need support now
      </Link>

      {!intention && !showIntentionPicker && (
        <button
          onClick={() => setShowIntentionPicker(true)}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "transparent",
            border: `1px dashed ${T.border}`,
            borderRadius: 12,
            color: T.textSub,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 24,
            minHeight: 44,
          }}
        >
          Set today's intention
        </button>
      )}

      {showIntentionPicker && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: T.textMuted,
              marginBottom: 12,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            What's your word for today?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {defaultIntentions.map((word) => (
              <button
                key={word}
                onClick={() => {
                  setIntention(word);
                  setShowIntentionPicker(false);
                }}
                style={{
                  padding: "10px 16px",
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {intention && (
        <div
          style={{
            padding: "16px 20px",
            background: `rgba(47, 190, 110, 0.08)`,
            borderRadius: 12,
            border: `1px solid ${T.recovery}33`,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.textMuted, marginBottom: 6, letterSpacing: "0.05em" }}>
            Today's intention
          </div>
          <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: 24, color: T.recovery, letterSpacing: "0.02em", marginBottom: 6 }}>
            {intention}
          </div>
        </div>
      )}

      <div
        style={{
          padding: "20px",
          background: T.bgSurface,
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: T.textMuted,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Reflection
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.text, marginBottom: 16, lineHeight: 1.6 }}>
          {dailyPrompt}
        </p>
        <button
          onClick={onJournalTap}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "transparent",
            border: `1px solid ${T.recovery}`,
            borderRadius: 8,
            color: T.recovery,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Write today's note →
        </button>
      </div>

      <button
        onClick={onRelapseTap}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          color: T.textSub,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 24,
          minHeight: 44,
        }}
      >
        I slipped — start again
      </button>

      <PrivacyNotice />
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

  const streak = user?.streak ?? 0;
  const longestStreak = user?.longestStreak ?? 0;

  useEffect(() => {
    const onboardingSeen = localStorage.getItem("onboarding_seen");
    if (!onboardingSeen) {
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
      // Keep the modal open and the text intact so nothing is lost.
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
    <div
      style={{
        background: T.bg,
        color: T.text,
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingComplete} />
      )}

      {showPostRelapse && (
        <PostRelapseFlow onComplete={handleRelapseComplete} previousStreak={streak} />
      )}

      <Modal
        open={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        title="What's on your mind?"
        align="bottom"
      >
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.currentTarget.value.slice(0, 5000))}
          placeholder="Write freely. Your notes are encrypted and private."
          aria-label="Journal entry"
          autoFocus
          style={{
            width: "100%",
            padding: "14px",
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            color: T.text,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            outline: "none",
            resize: "none",
            minHeight: 200,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: T.textMuted, marginBottom: 12 }}>
          {journal.length} / 5000
        </div>
        <button
          onClick={handleSaveJournal}
          disabled={journalSaving}
          style={{
            width: "100%",
            padding: "14px 18px",
            background: T.recovery,
            border: "none",
            borderRadius: 10,
            color: "#000",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: journalSaving ? "default" : "pointer",
            marginBottom: 8,
            minHeight: 44,
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
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            color: T.textSub,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          Cancel
        </button>
      </Modal>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 24px",
          background: `linear-gradient(to bottom, ${T.bg} 70%, transparent)`,
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: 56,
        }}
      >
        <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", fontSize: 18, letterSpacing: "0.14em", color: T.text }}>
          RESET
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/settings"
            style={{
              color: T.textSub,
              fontSize: 13,
              textDecoration: "none",
              padding: "10px 12px",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Settings
          </Link>
        </div>
      </nav>

      {journalSaved && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            background: T.recovery,
            color: "#000",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Note saved securely ✓
        </div>
      )}

      {hasSeenOnboarding && (
        <HomeScreen
          streak={streak}
          longestStreak={longestStreak}
          onJournalTap={() => setShowJournalModal(true)}
          onRelapseTap={() => setShowPostRelapse(true)}
        />
      )}

      {!authReady && (
        <div
          aria-hidden
          style={{ position: "fixed", bottom: 60, left: 0, right: 0, textAlign: "center", fontSize: 11, color: T.textMuted }}
        >
          Securing your private space…
        </div>
      )}
    </div>
  );
}
