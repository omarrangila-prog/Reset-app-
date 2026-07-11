import { useState } from "react";
import { api } from "@/lib/api";

interface PostRelapseFlowProps {
  onComplete: () => void;
}

export function PostRelapseFlow({ onComplete }: PostRelapseFlowProps) {
  const [stage, setStage] = useState<"compassion" | "reflection" | "reset">("compassion");
  const [reflection, setReflection] = useState({ before: "", need: "", next: "" });
  const [saving, setSaving] = useState(false);

  // Record the relapse (resets streak, no penalty) and persist the reflection
  // as an encrypted journal entry so the user's honest processing is not lost.
  const commitRelapse = async () => {
    setSaving(true);
    try {
      await api.logRelapse();
      const parts = [
        reflection.before && `Before: ${reflection.before}`,
        reflection.need && `Needed: ${reflection.need}`,
        reflection.next && `Next time: ${reflection.next}`,
      ].filter(Boolean);
      if (parts.length > 0) {
        await api.createJournal(parts.join("\n"), "relapse-reflection").catch(() => {});
      }
    } catch {
      /* best-effort; the compassionate flow should never block on network */
    } finally {
      setSaving(false);
    }
  };

  const T = {
    bg: "#F5F7FC",
    bgSurface: "#FFFFFF",
    text: "#1C2333",
    textSub: "#5A6478",
    textMuted: "#8A93A6",
    border: "#E6EAF2",
    recovery: "#2FBE6E",
    amber: "#5B7CFA",
  };

  const handleComplete = async () => {
    if (saving) return; // guard against double-taps while the relapse is recording
    if (stage === "compassion") {
      setStage("reflection");
    } else if (stage === "reflection") {
      // Confirming the reflection is the point of commitment — record it here.
      await commitRelapse();
      setStage("reset");
    } else {
      onComplete();
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
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>
        {stage === "compassion" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `rgba(91, 124, 250, 0.1)`,
                border: `1px solid ${T.amber}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                margin: "0 auto 24px",
              }}
            >
              ❤️
            </div>

            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 36,
                color: T.text,
                marginBottom: 12,
                letterSpacing: "0.02em",
              }}
            >
              You came back.
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: T.amber,
                fontWeight: 500,
                marginBottom: 16,
                letterSpacing: "0.02em",
              }}
            >
              That's not nothing — that's everything.
            </p>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: T.textSub,
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              Recovery isn't linear. Every person who gets better has relapsed. You're still here. That's what matters.
            </p>

            <button
              onClick={handleComplete}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: T.amber,
                border: "none",
                borderRadius: 12,
                color: T.bg,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Ready to reflect? →
            </button>
          </div>
        )}

        {stage === "reflection" && (
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
              Understanding the moment
            </h2>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: T.textMuted,
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                }}
              >
                What was happening right before?
                <span style={{ color: T.textMuted, fontWeight: "normal" }}> (optional)</span>
              </label>
              <textarea
                value={reflection.before}
                onChange={(e) => setReflection({ ...reflection, before: e.target.value })}
                placeholder="Just a few words..."
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
                  resize: "vertical",
                  minHeight: 60,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: T.textMuted,
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                }}
              >
                What do you need right now?
                <span style={{ color: T.textMuted, fontWeight: "normal" }}> (optional)</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Rest", "Distraction", "Someone to talk to"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setReflection({ ...reflection, need: option })}
                    style={{
                      padding: "12px 14px",
                      background: reflection.need === option ? T.recovery + "20" : "transparent",
                      border: `1px solid ${reflection.need === option ? T.recovery : T.border}`,
                      borderRadius: 8,
                      color: T.text,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
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
                }}
              >
                One thing you'll do differently next time?
                <span style={{ color: T.textMuted, fontWeight: "normal" }}> (optional)</span>
              </label>
              <input
                type="text"
                value={reflection.next}
                onChange={(e) => setReflection({ ...reflection, next: e.target.value })}
                placeholder="Even small ideas count..."
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

            <button
              onClick={handleComplete}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: T.amber,
                border: "none",
                borderRadius: 12,
                color: T.bg,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Ready to reset? →
            </button>
          </div>
        )}

        {stage === "reset" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `rgba(24, 168, 86, 0.1)`,
                border: `1px solid ${T.recovery}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                margin: "0 auto 24px",
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: 40,
                color: T.recovery,
                marginBottom: 16,
                letterSpacing: "0.02em",
              }}
            >
              Day 1. Again.
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
              You've got this. Every reset is a victory.
            </p>

            <button
              onClick={handleComplete}
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
      </div>
    </div>
  );
}
