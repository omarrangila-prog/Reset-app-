"use client";

import { t } from "./theme";

/**
 * Hero recovery ring — an SVG progress arc with a soft gradient stroke and a
 * large day count in the center. Animated stroke on mount (respects reduced
 * motion via CSS). `progress` 0..1 fills the arc.
 */
export function RecoveryRing({
  days,
  progress,
  label = "days of recovery",
  size = 220,
}: {
  days: number;
  progress: number;
  label?: string;
  size?: number;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = c * clamped;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B7CFA" />
            <stop offset="60%" stopColor="#7C6BF0" />
            <stop offset="100%" stopColor="#4FB6F5" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E9EDF7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          aria-live="polite"
          style={{ fontFamily: t.fontHeading, fontSize: size * 0.28, fontWeight: 700, color: t.text, lineHeight: 1 }}
        >
          {days}
        </div>
        <div style={{ fontSize: 13, color: t.sub, marginTop: 4 }}>Days</div>
        <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}
