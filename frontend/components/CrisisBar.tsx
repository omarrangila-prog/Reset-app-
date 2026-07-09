"use client";

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
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <a
          href="/urge"
          style={{
            display: "inline-flex",
            flex: 1,
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            color: T.textSub,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            cursor: "pointer",
            alignItems: "center",
            letterSpacing: "0.05em",
            textDecoration: "none",
            minHeight: 44,
          }}
        >
          Need support now? Open the calm support page →
        </a>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-controls="crisis-resources"
          style={{
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            borderLeft: `1px solid ${T.border}`,
            color: T.amber,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          {isExpanded ? "Hide help ▾" : "Crisis help ▴"}
        </button>
      </div>

      {isExpanded && (
        <div
          id="crisis-resources"
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
              { label: "988 Suicide & Crisis Lifeline", value: "Call or text 988", href: "tel:988" },
              { label: "Crisis Text Line", value: "Text HOME to 741741", href: "sms:741741?&body=HOME" },
              { label: "SAMHSA Helpline", value: "1-800-662-4357", href: "tel:18006624357" },
              { label: "Immediate danger?", value: "Call 911", href: "tel:911" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  background: T.bg,
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  textDecoration: "none",
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
              </a>
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
