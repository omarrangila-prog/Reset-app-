"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── NIGHT CHECK-IN COMPONENTS ───────────────────────────────────────────────

// Day Reflection
function DayReflection({ onComplete }: { onComplete: (reflection: { wins: string[], challenges: string[], tomorrow: string }) => void }) {
  const [wins, setWins] = useState(["", ""]);
  const [challenges, setChallenges] = useState(["", ""]);
  const [tomorrow, setTomorrow] = useState("");

  const handleSubmit = () => {
    const validWins = wins.filter(w => w.trim());
    const validChallenges = challenges.filter(c => c.trim());
    if (validWins.length >= 1 && tomorrow.trim()) {
      onComplete({
        wins: validWins,
        challenges: validChallenges,
        tomorrow: tomorrow,
      });
    }
  };

  const updateWins = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  const updateChallenges = (index: number, value: string) => {
    const newChallenges = [...challenges];
    newChallenges[index] = value;
    setChallenges(newChallenges);
  };

  return (
    <div style={{ padding: "clamp(24px, 8vw, 32px) clamp(16px, 6vw, 24px)" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(24px, 8vw, 28px)",
        color: "#E8A020",
        marginBottom: 24,
        textAlign: "center",
      }}>
        DAY REFLECTION
      </div>

      {/* Wins */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: "#1C2333",
          marginBottom: 16,
        }}>
          What went well today? (2-3 wins)
        </div>
        {wins.map((win, index) => (
          <input
            key={index}
            type="text"
            value={win}
            onChange={(e) => updateWins(index, e.target.value)}
            placeholder="I successfully..."
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid #E6EAF2",
              borderRadius: 8,
              padding: "clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)",
              color: "#1C2333",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(12px, 3.5vw, 14px)",
              marginBottom: 8,
              outline: "none",
            }}
          />
        ))}
      </div>

      {/* Challenges */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: "#1C2333",
          marginBottom: 16,
        }}>
          What challenged you? (optional)
        </div>
        {challenges.map((challenge, index) => (
          <input
            key={index}
            type="text"
            value={challenge}
            onChange={(e) => updateChallenges(index, e.target.value)}
            placeholder="I struggled with..."
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid #E6EAF2",
              borderRadius: 8,
              padding: "clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)",
              color: "#1C2333",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(12px, 3.5vw, 14px)",
              marginBottom: 8,
              outline: "none",
            }}
          />
        ))}
      </div>

      {/* Tomorrow */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          color: "#1C2333",
          marginBottom: 16,
        }}>
          One thing you'll do differently tomorrow
        </div>
        <textarea
          value={tomorrow}
          onChange={(e) => setTomorrow(e.target.value)}
          placeholder="Tomorrow I will..."
          style={{
            width: "100%",
            minHeight: 80,
            background: "#FFFFFF",
            border: "1px solid #E6EAF2",
            borderRadius: 8,
            padding: "clamp(10px, 3vw, 12px) clamp(12px, 4vw, 16px)",
            color: "#1C2333",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(12px, 3.5vw, 14px)",
            resize: "none",
            outline: "none",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={wins.filter(w => w.trim()).length < 1 || !tomorrow.trim()}
        style={{
          width: "100%",
          background: (wins.filter(w => w.trim()).length >= 1 && tomorrow.trim()) ? "#E8A020" : "#E6EAF2",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          color: (wins.filter(w => w.trim()).length >= 1 && tomorrow.trim()) ? "#F5F7FC" : "#5A6478",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          cursor: (wins.filter(w => w.trim()).length >= 1 && tomorrow.trim()) ? "pointer" : "not-allowed",
        }}
      >
        Complete Reflection
      </button>
    </div>
  );
}

// Streak Protection
function StreakProtection({ currentStreak, onComplete }: { currentStreak: number; onComplete: () => void }) {
  const [affirmations, setAffirmations] = useState([
    "I am stronger than my urges",
    "Tomorrow is a new opportunity",
    "I choose discipline over comfort",
    "My future self will thank me",
    "I am in control of my actions",
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 28,
        color: "#2FBE6E",
        marginBottom: 16,
      }}>
        STREAK PROTECTION
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16,
        color: "#5A6478",
        marginBottom: 32,
      }}>
        Current streak: {currentStreak} days
      </div>

      {!completed ? (
        <>
          <div style={{
            fontSize: 18,
            color: "#1C2333",
            marginBottom: 8,
            minHeight: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            "{affirmations[currentIndex]}"
          </div>
          <div style={{
            fontSize: 14,
            color: "#5A6478",
            marginBottom: 32,
          }}>
            Read aloud • {currentIndex + 1} of {affirmations.length}
          </div>
          <button
            onClick={handleNext}
            style={{
              background: "#2FBE6E",
              border: "none",
              borderRadius: 12,
              padding: "16px 32px",
              color: "#F5F7FC",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {currentIndex < affirmations.length - 1 ? "Next Affirmation" : "Complete Protection"}
          </button>
        </>
      ) : (
        <div>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(24,168,86,0.12)",
            border: "1px solid rgba(24,168,86,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#2FBE6E",
            margin: "0 auto 24px",
          }}>
            ✓
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24,
            color: "#2FBE6E",
            marginBottom: 16,
          }}>
            STREAK SECURED
          </div>
          <div style={{
            fontSize: 16,
            color: "#5A6478",
          }}>
            Your discipline is protected for tomorrow.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN NIGHT PAGE ─────────────────────────────────────────────────────────
export default function NightPage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "reflection" | "protection" | "complete">("welcome");
  const [reflection, setReflection] = useState<{ wins: string[], challenges: string[], tomorrow: string } | null>(null);

  // Mock data - in real app, get from store/API
  const currentStreak = 7;

  const handleReflectionComplete = (newReflection: { wins: string[], challenges: string[], tomorrow: string }) => {
    setReflection(newReflection);
    setStep("protection");
  };

  const handleProtectionComplete = () => {
    setStep("complete");
    // Here you would save to backend
  };

  const handleFinish = () => {
    router.push("/");
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F7FC",
      color: "#1C2333",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid #E6EAF2",
        background: "rgba(245,247,252,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#5A6478",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Back
        </button>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          letterSpacing: "0.02em",
        }}>
          NIGHT CHECK-IN
        </div>
        <div style={{
          fontSize: 14,
          color: "#5A6478",
        }}>
          {currentTime} • End your day with reflection
        </div>
      </div>

      {/* Progress Indicator */}
      <div style={{
        padding: "16px 24px",
        display: "flex",
        gap: 8,
      }}>
        {["reflection", "protection"].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: step === "complete" || (step !== "welcome" && ["reflection", "protection"].indexOf(step) > i) ? "#2FBE6E" : "#E6EAF2",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {step === "welcome" && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 48,
              color: "#E8A020",
              marginBottom: 16,
            }}>
              GOOD NIGHT
            </div>
            <div style={{
              fontSize: 18,
              color: "#5A6478",
              marginBottom: 32,
              lineHeight: 1.5,
            }}>
              Reflect on your day and protect your streak.<br />
              This 5-minute ritual ensures tomorrow's success.
            </div>
            <button
              onClick={() => setStep("reflection")}
              style={{
                background: "#E8A020",
                border: "none",
                borderRadius: 12,
                padding: "16px 32px",
                color: "#F5F7FC",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Night Check-in
            </button>
          </div>
        )}

        {step === "reflection" && (
          <DayReflection onComplete={handleReflectionComplete} />
        )}

        {step === "protection" && (
          <StreakProtection currentStreak={currentStreak} onComplete={handleProtectionComplete} />
        )}

        {step === "complete" && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(24,168,86,0.12)",
              border: "1px solid rgba(24,168,86,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#2FBE6E",
              margin: "0 auto 24px",
            }}>
              🌙
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              color: "#2FBE6E",
              marginBottom: 16,
            }}>
              NIGHT COMPLETE
            </div>
            <div style={{
              fontSize: 16,
              color: "#5A6478",
              marginBottom: 32,
              lineHeight: 1.5,
            }}>
              Rest well. Tomorrow brings new strength.<br />
              Your calm grows with each day.
            </div>

            {reflection && (
              <div style={{
                background: "#FFFFFF",
                border: "1px solid #E6EAF2",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                textAlign: "left",
              }}>
                <div style={{
                  fontSize: 12,
                  color: "#E8A020",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  Tomorrow's Focus
                </div>
                <div style={{
                  fontSize: 16,
                  color: "#1C2333",
                }}>
                  {reflection.tomorrow}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              style={{
                background: "#2FBE6E",
                border: "none",
                borderRadius: 12,
                padding: "16px 32px",
                color: "#F5F7FC",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sleep Well →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}