"use client";

import { useState } from "react";

interface CrisisBarProps {
  position?: "bottom" | "top";
}

export function CrisisBar(_props: CrisisBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme-aware via CSS vars so the SOS affordance follows dark mode.
  const T = {
    bg: "var(--bg-surface)",
    bgSurface: "var(--bg-glass-strong)",
    text: "var(--text)",
    textSub: "var(--text-sub)",
    textMuted: "var(--text-muted)",
    border: "var(--border)",
    amber: "var(--urge)",
  };

  // Floating, compact SOS affordance. Anchored top-right so it never collides
  // with the bottom navigation or the coach composer, and expands downward.
  const anchor = { top: "calc(env(safe-area-inset-top) + 14px)" };

  return (
    <div
      style={{
        position: "fixed",
        ...anchor,
        right: 12,
        left: isExpanded ? 12 : "auto",
        maxWidth: 460,
        margin: isExpanded ? "0 auto" : undefined,
        zIndex: 95,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        background: T.bgSurface,
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        boxShadow: "0 8px 24px rgba(46,62,120,0.10)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-controls="crisis-resources"
          style={{
            padding: "10px 16px",
            background: "transparent",
            border: "none",
            color: T.amber,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isExpanded ? "✕ Hide crisis help" : "🆘 Crisis help"}
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
