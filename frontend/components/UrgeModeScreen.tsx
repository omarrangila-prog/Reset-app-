"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalmSphere } from "@/components/ui/CalmSphere";
import { loadPlan, UrgeAction } from "@/lib/urgePlan";

interface UrgeModeScreenProps {
  onComplete: () => void;
}

export function UrgeModeScreen({ onComplete }: UrgeModeScreenProps) {
  const [plan, setPlan] = useState<UrgeAction[]>([]);
  useEffect(() => { setPlan(loadPlan()); }, []);
  const [stage, setStage] = useState<"message" | "breathing" | "timer" | "distraction" | "complete">("message");
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [distractionPrompt] = useState(
    [
      "Name 5 things you can see right now",
      "Stand up and drink a full glass of water",
      "Text someone you trust: 'Hey, just checking in'",
      "Walk to a different room and describe what you see",
      "Put on a song you love",
      "Call someone for 2 minutes",
      "Write down 3 things you're grateful for",
    ][Math.floor(Math.random() * 7)]
  );

  const T = {
    // Calm-mode palette — theme-aware so SOS/calm mode follows dark mode.
    bg: "var(--grad-calm)",
    bgSurface: "var(--bg-surface)",
    text: "var(--text)",
    textSub: "var(--text-sub)",
    textMuted: "var(--text-muted)",
    border: "var(--border)",
    accent: "var(--accent)",
    recovery: "var(--grad-hero)",
    recoverySolid: "var(--accent)",
  };

  // Breathing is now handled by the self-managing <CalmSphere /> component.

  // Timer
  useEffect(() => {
    if (stage !== "timer" || !timerRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          setStage("complete");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timerRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        zIndex: 10000,
        animation: "fadeIn 0.3s ease",
        overflowY: "auto",
      }}
    >
      {/* Leave — a calm exit, always available */}
      <button
        onClick={onComplete}
        aria-label="Leave calm mode"
        style={{
          position: "absolute", top: "calc(env(safe-area-inset-top) + 16px)", right: 18,
          width: 44, height: 44, borderRadius: 14, border: `1px solid ${T.border}`,
          background: "var(--bg-glass)", backdropFilter: "blur(10px)", color: T.textMuted,
          display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20,
        }}
      >
        ✕
      </button>

      <div style={{ maxWidth: 520, width: "100%", maxHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Message Stage */}
        {stage === "message" && (
          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 44,
                color: T.text,
                marginBottom: 16,
                letterSpacing: "0.02em",
              }}
            >
              You noticed.
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: T.textSub,
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              That's already the hardest part.
            </p>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: T.textMuted,
                lineHeight: 1.6,
                marginBottom: 40,
              }}
            >
              You have a choice right now. Take a breath. Let's get through this together.
            </p>

            <button
              onClick={() => setStage("breathing")}
              style={{
                padding: "16px 24px",
                background: T.recovery,
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Let's breathe →
            </button>

            {/* Your personal recovery plan — shown first, one tap each. */}
            {plan.length > 0 && (
              <div style={{ marginTop: 28, textAlign: "left", background: "var(--bg-surface)", border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 12 }}>Your recovery plan</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.slice(0, 5).map((a, i) => {
                    const row = (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--grad-hero)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 14.5, color: T.text, fontWeight: 500 }}>{a.label}</span>
                        {a.href && <span style={{ marginLeft: "auto", color: T.textMuted, fontSize: 16 }} aria-hidden>›</span>}
                      </div>
                    );
                    return a.href
                      ? <Link key={a.id} href={a.href} style={{ display: "block", padding: "8px 0" }}>{row}</Link>
                      : <div key={a.id} style={{ padding: "8px 0" }}>{row}</div>;
                  })}
                </div>
                <Link href="/urge/plan" style={{ display: "inline-block", marginTop: 12, fontSize: 12.5, color: "var(--accent-text)", fontWeight: 600 }}>Edit my plan →</Link>
              </div>
            )}

            {/* Quick tools */}
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/urge/delay" style={{ padding: "9px 15px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}` }}>Wait 10 minutes</Link>
              <Link href="/urge/environment" style={{ padding: "9px 15px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}` }}>Change environment</Link>
            </div>

            {/* Always-available crisis resources. */}
            <div style={{ marginTop: 28, display: "grid", gap: 8 }}>
              <div style={{ fontSize: 12, color: T.textMuted, letterSpacing: "0.04em" }}>
                In crisis? Reach a person now:
              </div>
              {[
                { label: "Call or text 988", href: "tel:988" },
                { label: "Text HOME to 741741", href: "sms:741741" },
                { label: "Emergency — call 911", href: "tel:911" },
              ].map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "var(--bg-surface)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Breathing Stage */}
        {stage === "breathing" && (
          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              Take a deep breath · this feeling will pass
            </p>

            <div style={{ marginBottom: 28 }}>
              <CalmSphere size={260} />
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: T.textMuted,
                marginBottom: 32,
              }}
            >
              Inhale 4s · Hold 4s · Exhale 6s
            </p>

            <button
              onClick={() => setStage("timer")}
              style={{
                padding: "14px 24px",
                background: T.accent,
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              I&apos;m ready to continue →
            </button>
          </div>
        )}

        {/* Timer Stage */}
        {stage === "timer" && (
          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Grounding timer
            </p>

            <div
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 96,
                color: T.recoverySolid,
                marginBottom: 16,
                lineHeight: 1,
                letterSpacing: "0.01em",
              }}
            >
              {formatTime(timerSeconds)}
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: T.textSub,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Strong feelings often settle in 15 minutes. Stay with the process.
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  background: T.recovery,
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {timerRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => setStage("distraction")}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Need help?
              </button>
            </div>

            <button
              onClick={() => setStage("complete")}
              style={{
                padding: "12px 18px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.textSub,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              I made it through →
            </button>
          </div>
        )}

        {/* Distraction Stage */}
        {stage === "distraction" && (
          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Quick distraction
            </p>

            <div
              style={{
                padding: "24px",
                background: "rgba(110, 140, 251, 0.08)",
                borderRadius: 14,
                border: `1px solid ${T.recovery}33`,
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 18,
                  color: T.recoverySolid,
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                {distractionPrompt}
              </p>
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: T.textMuted,
                marginBottom: 24,
              }}
            >
              What triggered this? (optional)
            </p>

            <textarea
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="Just a few words..."
              style={{
                width: "100%",
                padding: "12px 14px",
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.text,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                outline: "none",
                minHeight: 80,
                marginBottom: 24,
                resize: "none",
              }}
            />

            <button
              onClick={() => setStage("complete")}
              style={{
                width: "100%",
                padding: "14px 18px",
                background: T.recovery,
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              I made it through →
            </button>
          </div>
        )}

        {/* Complete Stage */}
        {stage === "complete" && (
          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Soft lavender orb, not a green success card */}
            <div
              style={{
                width: 108, height: 108, borderRadius: "50%", margin: "0 auto 24px",
                background: "radial-gradient(circle at 35% 30%, #8AA6FF, #6E8CFB 55%, #7C6BF0 100%)",
                boxShadow: "0 14px 44px rgba(91,124,250,0.4), inset 0 3px 12px rgba(255,255,255,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, color: "#fff", animation: "scaleIn 0.5s ease",
              }}
            >
              ✓
            </div>

            <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", marginBottom: 10 }}>
              You stayed with it.
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: T.textSub, lineHeight: 1.7, marginBottom: 28, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
              You stayed with the feeling instead of chasing it. That matters — and it gets easier each time.
            </p>

            {/* Reflection choices */}
            <div style={{ display: "grid", gap: 10, maxWidth: 340, margin: "0 auto", width: "100%" }}>
              <button onClick={onComplete} style={{ padding: "15px", background: T.recovery, border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 10px 24px rgba(91,124,250,0.28)" }}>
                I feel calmer
              </button>
              <button onClick={() => setStage("breathing")} style={{ padding: "14px", background: T.bgSurface, border: `1px solid ${T.border}`, borderRadius: 16, color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Try another round of breathing
              </button>
              <a href="/coach" style={{ padding: "14px", background: T.bgSurface, border: `1px solid ${T.border}`, borderRadius: 16, color: T.text, fontSize: 14, fontWeight: 600, textAlign: "center", display: "block" }}>
                Talk to my coach
              </a>
              <a href="tel:988" style={{ padding: "12px", color: T.recoverySolid, fontSize: 13, fontWeight: 600, textAlign: "center", display: "block" }}>
                I still need support — reach a person
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
