"use client";

import { t } from "./theme";

/**
 * A small, warm "here's what this is" banner for the top of a feature screen.
 * Answers: what it is · how long · what you'll get — in plain words, so a tired
 * or overwhelmed person understands it instantly. Dismissible feel via compact size.
 */
export function FeatureIntro({
  what,
  time,
  benefit,
}: {
  what: string;
  time: string;
  benefit: string;
}) {
  return (
    <div
      style={{
        background: t.accentSoft,
        border: `1px solid ${t.accent}22`,
        borderRadius: 16,
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, marginBottom: 8 }}>{what}</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: t.sub }}>
        <span>🕒 {time}</span>
        <span style={{ color: t.accent, fontWeight: 600 }}>💙 {benefit}</span>
      </div>
    </div>
  );
}
