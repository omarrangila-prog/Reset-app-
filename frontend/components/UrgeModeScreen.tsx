"use client";

import { useState, useEffect } from "react";

interface UrgeModeScreenProps {
  onComplete: () => void;
}

export function UrgeModeScreen({ onComplete }: UrgeModeScreenProps) {
  const [stage, setStage] = useState<"message" | "breathing" | "timer" | "distraction" | "complete">("message");
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingScale, setBreathingScale] = useState(0.85);
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
    // Light "calm mode" palette with a soft gradient canvas.
    bg: "linear-gradient(165deg, #EAF0FF 0%, #F3EEFF 55%, #EAFBF4 100%)",
    bgSurface: "#FFFFFF",
    text: "#1C2333",
    textSub: "#5A6478",
    textMuted: "#8A93A6",
    border: "#E6EAF2",
    accent: "#5B7CFA",
    recovery: "#2FBE6E",
  };

  // Breathing exercise
  useEffect(() => {
    if (stage !== "breathing") return;

    const timing = { inhale: 4000, hold: 7000, exhale: 8000 };
    let phase: "inhale" | "hold" | "exhale" = "inhale";

    const cycle = () => {
      phase = "inhale";
      setBreathingPhase("Breathe in...");
      setBreathingScale(1.2);

      const holdTimeout = setTimeout(() => {
        phase = "hold";
        setBreathingPhase("Hold...");
      }, timing.inhale);

      const exhaleTimeout = setTimeout(() => {
        phase = "exhale";
        setBreathingPhase("Breathe out...");
        setBreathingScale(0.8);
      }, timing.inhale + timing.hold);

      const nextCycleTimeout = setTimeout(cycle, timing.inhale + timing.hold + timing.exhale);

      return () => {
        clearTimeout(holdTimeout);
        clearTimeout(exhaleTimeout);
        clearTimeout(nextCycleTimeout);
      };
    };

    cycle();
  }, [stage]);

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
                color: "#000",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Let's breathe →
            </button>

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
                    background: "#FFFFFF",
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
                marginBottom: 32,
              }}
            >
              4-7-8 breathing exercise
            </p>

            <div style={{ position: "relative", width: 240, height: 240, margin: "0 auto 32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Layered concentric glow rings breathe together — depth, not a flat circle */}
              {[1, 0.72, 0.48].map((s, i) => (
                <div
                  key={i}
                  aria-hidden
                  style={{
                    position: "absolute",
                    width: 240 * s,
                    height: 240 * s,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(91,124,250,${0.14 - i * 0.03}) 0%, transparent 70%)`,
                    border: `1px solid rgba(124,107,240,${0.28 - i * 0.07})`,
                    transform: `scale(${breathingScale})`,
                    transition: "transform 3.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              ))}
            <div
              style={{
                width: 132,
                height: 132,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #8AA6FF 0%, #6E8CFB 45%, #7C6BF0 100%)",
                boxShadow: "0 12px 40px rgba(91,124,250,0.45), inset 0 2px 8px rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${breathingScale})`,
                transition: "transform 3.8s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Soft inner sheen — clean luminous orb, no glyph */}
              <div aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)" }} />
            </div>
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 22,
                color: T.text,
                fontWeight: 600,
                marginBottom: 16,
                letterSpacing: "0.01em",
                height: 32,
              }}
            >
              {breathingPhase}
            </p>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: T.textMuted,
                marginBottom: 40,
              }}
            >
              Follow the circle. 90 seconds.
            </p>

            <button
              onClick={() => setStage("timer")}
              style={{
                padding: "14px 24px",
                background: T.accent,
                border: "none",
                borderRadius: 10,
                color: "#080809",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              I'm ready for the timer →
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
                color: T.recovery,
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
                  color: "#000",
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
                background: `rgba(24, 168, 86, 0.08)`,
                borderRadius: 14,
                border: `1px solid ${T.recovery}33`,
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 18,
                  color: T.recovery,
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
                color: "#000",
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
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: `rgba(245, 166, 35, 0.1)`,
                border: `2px solid ${T.accent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                margin: "0 auto 24px",
                animation: "scaleIn 0.5s ease",
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 40,
                color: T.accent,
                marginBottom: 12,
                letterSpacing: "0.05em",
              }}
            >
              SUPPORT COMPLETE
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: T.textSub,
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              You paused the momentum. That choice matters. Each return to calm builds your steady response.
            </p>

            <button
              onClick={onComplete}
              style={{
                padding: "16px 24px",
                background: T.recovery,
                border: "none",
                borderRadius: 12,
                color: "#000",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Continue →
            </button>
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
