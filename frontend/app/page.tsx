"use client";

import { useState, useEffect, useRef } from "react";
import { CrisisBar } from "@/components/CrisisBar";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PostRelapseFlow } from "@/components/PostRelapseFlow";
import { UrgeModeScreen } from "@/components/UrgeModeScreen";

// ─── DARK MODE COLOR TOKENS (Per spec) ────────────────────────────────────────
const T = {
  bg: "#141413",
  bgSurface: "#1A1A18",
  text: "#EDEDEB",
  textSub: "#7A7A80",
  textMuted: "#3A3A40",
  border: "#2C2C34",
  recovery: "#18A856",
  amber: "#D4A574",
  urge: "#E8352C",
};

// ─── HOME SCREEN ────────────────────────────────────────────────────────────────
function HomeScreen({
  stats,
  onUrgeTap,
  onJournalTap,
}: {
  stats: any;
  onUrgeTap: () => void;
  onJournalTap: () => void;
}) {
  const [intention, setIntention] = useState("");
  const [showIntentionPicker, setShowIntentionPicker] = useState(false);

  const defaultIntentions = ["Present", "Patient", "Strong", "Calm", "Clear", "Brave", "Kind", "Focused"];

  const reflectionPrompts = [
    "What are you proud of today?",
    "What triggered you most?",
    "How did you handle difficulty?",
    "What brought you joy?",
    "What did you learn?",
  ];

  const dailyPrompt = reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];

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
      {/* Streak Display */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
          padding: "32px 24px",
          background: `linear-gradient(135deg, rgba(24, 168, 86, 0.08) 0%, rgba(212, 165, 116, 0.04) 100%)`,
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
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: 64,
            color: T.recovery,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}
        >
          {stats.streak}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: T.amber,
            fontWeight: 500,
          }}
        >
          Day {stats.streak}. You're doing this.
        </div>
        {stats.longestStreak > stats.streak && (
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: T.textMuted,
              marginTop: 8,
            }}
          >
            Your longest streak: {stats.longestStreak} days
          </div>
        )}
      </div>

      {/* Urgency Button */}
      <button
        onClick={onUrgeTap}
        style={{
          width: "100%",
          padding: "18px 24px",
          background: T.urge,
          border: "none",
          borderRadius: 12,
          color: "#FFF",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 24,
          minHeight: 44,
          letterSpacing: "0.02em",
        }}
      >
        I'm struggling right now
      </button>

      {/* Daily Intention */}
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
            background: `rgba(24, 168, 86, 0.08)`,
            borderRadius: 12,
            border: `1px solid ${T.recovery}33`,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: T.textMuted,
              marginBottom: 6,
              letterSpacing: "0.05em",
            }}
          >
            Today's intention
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              fontSize: 24,
              color: T.recovery,
              letterSpacing: "0.02em",
              marginBottom: 6,
            }}
          >
            {intention}
          </div>
        </div>
      )}

      {/* Daily Reflection */}
      <div
        style={{
          padding: "20px",
          background: T.bgSurface,
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          marginBottom: 24,
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
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: T.text,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
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
          }}
        >
          Write today's note →
        </button>
      </div>

      {/* Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function Page() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUrgeModeFullscreen, setShowUrgeModeFullscreen] = useState(false);
  const [showPostRelapse, setShowPostRelapse] = useState(false);
  const [stats, setStats] = useState({
    streak: 7,
    longestStreak: 14,
    score: 62,
    sessionCount: 0,
  });
  const [journal, setJournal] = useState("");
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Initialize onboarding on first visit
  useEffect(() => {
    const onboardingSeen = localStorage.getItem("onboarding_seen");
    const sessionCount = parseInt(localStorage.getItem("session_count") || "0");

    if (!onboardingSeen && sessionCount === 0) {
      setShowOnboarding(true);
    } else {
      setHasSeenOnboarding(true);
    }

    localStorage.setItem("session_count", String(sessionCount + 1));
  }, []);

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem("onboarding_seen", "true");
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("struggle_time", data.timeOfDay);
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("onboarding_seen", "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const handleUrgeModeTap = () => {
    setShowUrgeModeFullscreen(true);
  };

  const handleUrgeComplete = () => {
    setShowUrgeModeFullscreen(false);
    setStats((s) => ({
      ...s,
      streak: s.streak + 1,
      longestStreak: Math.max(s.longestStreak, s.streak + 1),
    }));
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
        <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
      )}

      {showUrgeModeFullscreen && <UrgeModeScreen onComplete={handleUrgeComplete} />}

      {showPostRelapse && <PostRelapseFlow onComplete={() => setShowPostRelapse(false)} />}

      {/* Journal Modal */}
      {showJournalModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            zIndex: 1000,
            padding: "20px",
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          }}
        >
          <div
            style={{
              background: T.bgSurface,
              borderRadius: "16px 16px 0 0",
              padding: "24px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              What's on your mind?
            </div>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.currentTarget.value.slice(0, 500))}
              placeholder="Write freely. 500 characters max."
              style={{
                flex: 1,
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
              }}
            />
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: T.textMuted,
                marginBottom: 12,
              }}
            >
              {journal.length} / 500
            </div>
            <button
              onClick={() => setShowJournalModal(false)}
              style={{
                padding: "14px 18px",
                background: T.recovery,
                border: "none",
                borderRadius: 10,
                color: "#000",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 8,
              }}
            >
              Save note
            </button>
            <button
              onClick={() => {
                setJournal("");
                setShowJournalModal(false);
              }}
              style={{
                padding: "12px 18px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                color: T.textMuted,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
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
        <div
          style={{
            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
            fontSize: 18,
            letterSpacing: "0.14em",
            color: T.text,
          }}
        >
          RESET
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Your quiet space</div>
      </nav>

      {/* Main Content */}
      {hasSeenOnboarding && (
        <HomeScreen
          stats={stats}
          onUrgeTap={handleUrgeModeTap}
          onJournalTap={() => setShowJournalModal(true)}
        />
      )}

      {/* Crisis Bar */}
      <CrisisBar position="bottom" />

      <style>{`
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media (prefers-reduced-motion: no-preference) {
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        button {
          min-width: 44px;
          min-height: 44px;
        }

        body {
          font-size: 16px;
        }

        @supports (padding: max(0px)) {
          body {
            padding-bottom: max(12px, env(safe-area-inset-bottom));
          }
        }

        @media (prefers-color-scheme: dark) {
          body {
            background-color: #141413;
            color: #EDEDEB;
          }
        }
      `}</style>
    </div>
  );
}
