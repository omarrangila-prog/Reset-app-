import { useState } from "react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { PrivacyShield } from "@/components/ui/PrivacyShield";

interface OnboardingFlowProps {
  onComplete: (data: { reason: string; name: string; timeOfDay: string; remindTime?: string }) => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");

  const T = {
    bg: "#F5F7FC",
    bgSurface: "#FFFFFF",
    text: "#1C2333",
    textSub: "#5A6478",
    textMuted: "#8A93A6",
    border: "#E6EAF2",
    recovery: "#2FBE6E",
    recoveryDeep: "#128A4E", // AA (4.5:1) with white text
  };

  const handleNext = () => {
    if (screen === 1) setScreen(2);
    else if (screen === 2) setScreen(3);
    else if (screen === 3) {
      onComplete({ reason, name: name || "You", timeOfDay });
    }
  };

  const handleSkip = () => {
    if (screen === 2) {
      setScreen(3);
    } else {
      onSkip();
    }
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
      }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        {/* Screen 1 */}
        {screen === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 24 }}>
              <PrivacyShield size={116} />
            </div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 38,
                color: T.text,
                marginBottom: 12,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
              }}
            >
              A calm space to quit porn — at your own pace.
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: T.textSub,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              When an urge hits, this app helps you get through the moment — and
              slowly build habits that make it easier. Private. No judgment.
            </p>

            {/* What you can actually do here — plain, concrete, 3 things */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, textAlign: "left" }}>
              {[
                { t: "Get help in a hard moment", d: "One tap opens a calm breathing screen." },
                { t: "Track how you're doing", d: "See your days, feelings, and small wins." },
                { t: "Talk to a supportive coach", d: "An always-available chat, never judging." },
              ].map((item) => (
                <div key={item.t} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: T.bgSurface, border: `1px solid ${T.border}`, borderRadius: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: T.recovery, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 1 }} aria-hidden>✓</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.t}</div>
                    <div style={{ fontSize: 13, color: T.textSub, marginTop: 1 }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: T.recoveryDeep,
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
              Get started →
            </button>
          </div>
        )}

        {/* Screen 2 */}
        {screen === 2 && (
          <div>
            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              What brings you here?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                "I want to break a habit",
                "I want more clarity on my patterns",
                "I want to understand my triggers",
                "I'm just curious",
              ].map((option) => (
                <button
                  key={option}
                  onClick={() => setReason(option)}
                  style={{
                    padding: "16px 18px",
                    background: reason === option ? T.recovery + "20" : "transparent",
                    border: `1px solid ${reason === option ? T.recovery : T.border}`,
                    borderRadius: 10,
                    color: T.text,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleSkip}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  background: "transparent",
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.textSub,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={!reason}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  background: reason ? T.recovery : T.border,
                  border: "none",
                  borderRadius: 8,
                  color: reason ? "#000" : T.textMuted,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: reason ? "pointer" : "not-allowed",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Screen 3 */}
        {screen === 3 && (
          <div>
            <h2
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: T.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Almost there
            </h2>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: T.textMuted,
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                What do you want to be called?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="or we'll just say 'you'"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: T.bgSurface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  color: T.text,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: T.textMuted,
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                When do you usually struggle most?
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Morning", "Evening", "Late night", "Random times"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimeOfDay(time.toLowerCase())}
                    style={{
                      padding: "12px 14px",
                      background: timeOfDay === time.toLowerCase() ? T.recovery + "20" : "transparent",
                      border: `1px solid ${timeOfDay === time.toLowerCase() ? T.recovery : T.border}`,
                      borderRadius: 8,
                      color: T.text,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: "100%",
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
              Start my reset →
            </button>
            <div style={{ marginTop: 24 }}>
              <PrivacyNotice showOnboarding />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
