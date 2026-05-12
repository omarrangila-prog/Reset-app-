"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── MORNING RITUAL COMPONENTS ───────────────────────────────────────────────

// Breathing Exercise
function MorningBreathing({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const phases = [
    { name: "inhale", duration: 4000, instruction: "Breathe in deeply" },
    { name: "hold", duration: 2000, instruction: "Hold your breath" },
    { name: "exhale", duration: 6000, instruction: "Breathe out slowly" },
  ];

  useEffect(() => {
    if (!isActive) return;

    const cycle = () => {
      phases.forEach((p, i) => {
        setTimeout(() => {
          setPhase(p.name as any);
          if (i === phases.length - 1) {
            setCount(c => {
              if (c >= 4) { // 5 cycles total
                setIsActive(false);
                onComplete();
                return c;
              }
              return c + 1;
            });
          }
        }, i * 12000 + (count * 12000));
      });
    };

    cycle();
  }, [isActive, count]);

  const currentPhase = phases.find(p => p.name === phase)!;
  const progress = ((count * 12000 + (phases.findIndex(p => p.name === phase) * currentPhase.duration)) / (5 * 12000)) * 100;

  return (
    <div style={{ textAlign: "center", padding: "clamp(32px, 10vw, 40px) clamp(16px, 6vw, 24px)" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(24px, 8vw, 32px)",
        color: "#18A856",
        marginBottom: 16,
      }}>
        MORNING BREATH
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "clamp(14px, 4vw, 16px)",
        color: "#7A7A80",
        marginBottom: 32,
      }}>
        5 cycles of 4-2-6 breathing
      </div>

      <div style={{
        width: "clamp(100px, 25vw, 120px)",
        height: "clamp(100px, 25vw, 120px)",
        borderRadius: "50%",
        border: "2px solid #18A85644",
        margin: "0 auto 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <div style={{
          fontSize: "clamp(36px, 12vw, 48px)",
          color: "#18A856",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {5 - count}
        </div>
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid #18A856",
          clipPath: `inset(0 ${100 - progress}% 0 0)`,
        }} />
      </div>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "clamp(16px, 5vw, 18px)",
        color: "#EDEDEB",
        marginBottom: 8,
      }}>
        {currentPhase.instruction}
      </div>

      {!isActive && (
        <button
          onClick={() => setIsActive(true)}
          style={{
            background: "#18A856",
            border: "none",
            borderRadius: 12,
            padding: "16px 32px",
            color: "#080809",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 24,
          }}
        >
          Begin Breathing
        </button>
      )}
    </div>
  );
}

// Intention Setting
function IntentionSetting({ onComplete }: { onComplete: (intention: string) => void }) {
  const [intention, setIntention] = useState("");

  const handleSubmit = () => {
    if (intention.trim()) {
      onComplete(intention);
    }
  };

  return (
    <div style={{ padding: "40px 24px" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32,
        color: "#E8A020",
        marginBottom: 16,
        textAlign: "center",
      }}>
        SET INTENTION
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16,
        color: "#7A7A80",
        marginBottom: 32,
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        What will you focus on today? Write one clear intention.
      </div>

      <textarea
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="Today I will..."
        style={{
          width: "100%",
          minHeight: 120,
          background: "#151518",
          border: "1px solid #1E1E24",
          borderRadius: 12,
          padding: 16,
          color: "#EDEDEB",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          resize: "none",
          outline: "none",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={!intention.trim()}
        style={{
          width: "100%",
          background: intention.trim() ? "#E8A020" : "#1E1E24",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          color: intention.trim() ? "#080809" : "#7A7A80",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          cursor: intention.trim() ? "pointer" : "not-allowed",
          marginTop: 24,
        }}
      >
        Set Intention
      </button>
    </div>
  );
}

// Gratitude Practice
function GratitudePractice({ onComplete }: { onComplete: (gratitude: string[]) => void }) {
  const [items, setItems] = useState(["", "", ""]);

  const handleSubmit = () => {
    const validItems = items.filter(item => item.trim());
    if (validItems.length >= 1) {
      onComplete(validItems);
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  return (
    <div style={{ padding: "40px 24px" }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32,
        color: "#18A856",
        marginBottom: 16,
        textAlign: "center",
      }}>
        GRATITUDE
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 16,
        color: "#7A7A80",
        marginBottom: 32,
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        Write 3 things you're grateful for today.
      </div>

      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`I'm grateful for...`}
            style={{
              width: "100%",
              background: "#151518",
              border: "1px solid #1E1E24",
              borderRadius: 8,
              padding: "12px 16px",
              color: "#EDEDEB",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              outline: "none",
            }}
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={items.filter(item => item.trim()).length < 1}
        style={{
          width: "100%",
          background: items.filter(item => item.trim()).length >= 1 ? "#18A856" : "#1E1E24",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          color: items.filter(item => item.trim()).length >= 1 ? "#080809" : "#7A7A80",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          cursor: items.filter(item => item.trim()).length >= 1 ? "pointer" : "not-allowed",
          marginTop: 16,
        }}
      >
        Complete Gratitude
      </button>
    </div>
  );
}

// ─── MAIN MORNING PAGE ───────────────────────────────────────────────────────
export default function MorningPage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "breathing" | "intention" | "gratitude" | "complete">("welcome");
  const [intention, setIntention] = useState("");
  const [gratitude, setGratitude] = useState<string[]>([]);

  const handleBreathingComplete = () => {
    setStep("intention");
  };

  const handleIntentionComplete = (newIntention: string) => {
    setIntention(newIntention);
    setStep("gratitude");
  };

  const handleGratitudeComplete = (newGratitude: string[]) => {
    setGratitude(newGratitude);
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
      background: "#080809",
      color: "#EDEDEB",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid #1E1E24",
        background: "rgba(8,8,9,0.95)",
        backdropFilter: "blur(12px)",
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#7A7A80",
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
          MORNING RESET
        </div>
        <div style={{
          fontSize: 14,
          color: "#7A7A80",
        }}>
          {currentTime} • Start your day with intention
        </div>
      </div>

      {/* Progress Indicator */}
      <div style={{
        padding: "16px 24px",
        display: "flex",
        gap: 8,
      }}>
        {["breathing", "intention", "gratitude"].map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: step === "complete" || (step !== "welcome" && ["breathing", "intention", "gratitude"].indexOf(step) > i) ? "#18A856" : "#1E1E24",
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
              color: "#18A856",
              marginBottom: 16,
            }}>
              GOOD MORNING
            </div>
            <div style={{
              fontSize: 18,
              color: "#7A7A80",
              marginBottom: 32,
              lineHeight: 1.5,
            }}>
              Begin your day with clarity and purpose.<br />
              This 10-minute ritual will set your intention.
            </div>
            <button
              onClick={() => setStep("breathing")}
              style={{
                background: "#18A856",
                border: "none",
                borderRadius: 12,
                padding: "16px 32px",
                color: "#080809",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Morning Reset
            </button>
          </div>
        )}

        {step === "breathing" && (
          <MorningBreathing onComplete={handleBreathingComplete} />
        )}

        {step === "intention" && (
          <IntentionSetting onComplete={handleIntentionComplete} />
        )}

        {step === "gratitude" && (
          <GratitudePractice onComplete={handleGratitudeComplete} />
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
              color: "#18A856",
              margin: "0 auto 24px",
            }}>
              ✓
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              color: "#18A856",
              marginBottom: 16,
            }}>
              RESET COMPLETE
            </div>
            <div style={{
              fontSize: 16,
              color: "#7A7A80",
              marginBottom: 32,
              lineHeight: 1.5,
            }}>
              Your day begins with intention.<br />
              Stay disciplined, stay strong.
            </div>

            {intention && (
              <div style={{
                background: "#151518",
                border: "1px solid #1E1E24",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                textAlign: "left",
              }}>
                <div style={{
                  fontSize: 12,
                  color: "#E8A020",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  Today's Intention
                </div>
                <div style={{
                  fontSize: 16,
                  color: "#EDEDEB",
                }}>
                  {intention}
                </div>
              </div>
            )}

            <button
              onClick={handleFinish}
              style={{
                background: "#18A856",
                border: "none",
                borderRadius: 12,
                padding: "16px 32px",
                color: "#080809",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Begin Day →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}