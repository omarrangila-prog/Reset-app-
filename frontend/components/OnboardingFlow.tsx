import { useState } from "react";

interface OnboardingFlowProps {
  onComplete: (data: { reason: string; name: string; timeOfDay: string; remindTime?: string }) => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [remindTime, setRemindTime] = useState("");

  const T = {
    bg: "#080809",
    bgSurface: "#151518",
    text: "#EDEDEB",
    textSub: "#7A7A80",
    textMuted: "#3A3A40",
    border: "#1E1E24",
    recovery: "#18A856",
  };

  const handleNext = () => {
    if (screen === 1) setScreen(2);
    else if (screen === 2) setScreen(3);
    else if (screen === 3) {
      onComplete({ reason, name: name || "You", timeOfDay, remindTime });
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
            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 40,
                color: T.text,
                marginBottom: 16,
                letterSpacing: "0.02em",
              }}
            >
              You don't have to explain yourself.
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
              RESET is a private space. No judgments. No lectures. Just tools that help.
            </p>
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
              I'm ready →
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
                "I keep relapsing and I don't know why",
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
          </div>
        )}
      </div>
    </div>
  );
}
