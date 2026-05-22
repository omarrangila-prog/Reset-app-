import { useState } from "react";

interface CrisisBarProps {
  position?: "bottom" | "top";
}

export function CrisisBar({ position = "bottom" }: CrisisBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const T = {
    bg: "#080809",
    bgSurface: "#151518",
    text: "#EDEDEB",
    textSub: "#7A7A80",
    textMuted: "#3A3A40",
    border: "#1E1E24",
    amber: "#D4A574",
  };

  return (
    <div
      style={{
        position: "fixed",
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        borderTop: position === "bottom" ? `1px solid ${T.border}` : `1px solid ${T.border}`,
        background: T.bgSurface,
        backdropFilter: "blur(12px)",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          color: T.textSub,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          cursor: "pointer",
          textAlign: "center",
          transition: "color 0.2s",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = T.textSub)}
      >
        {isExpanded ? "Hide" : "Need urgent support? You're not alone."} ↓
      </button>

      {isExpanded && (
        <div
          style={{
            padding: "16px",
            borderTop: `1px solid ${T.border}`,
            background: `linear-gradient(135deg, rgba(212,165,116,0.05) 0%, rgba(232,53,44,0.02) 100%)`,
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
            Resources
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Crisis Text Line", value: "Text HOME to 741741" },
              { label: "SAMHSA Helpline", value: "1-800-662-4357" },
              { label: "988 Lifeline", value: "Call or text 988" },
              { label: "Immediate danger?", value: "Call 911" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "10px 12px",
                  background: T.bg,
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: T.amber,
                    fontWeight: 500,
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: T.text,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: T.bg,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: T.textSub,
              lineHeight: 1.6,
            }}
          >
            You're not alone in this. Reaching out is a sign of strength, not weakness.
          </div>
        </div>
      )}
    </div>
  );
}
