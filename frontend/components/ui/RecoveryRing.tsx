"use client";

import { motion, useReducedMotion } from "framer-motion";
import { t } from "./theme";

/**
 * Hero recovery ring. On a mesh-gradient hero it renders as a luminous white
 * arc with a soft glow; the fill animates in with a spring on mount.
 */
export function RecoveryRing({
  days,
  progress,
  label = "of recovery",
  size = 224,
  onMesh = false,
}: {
  days: number;
  progress: number;
  label?: string;
  size?: number;
  onMesh?: boolean;
}) {
  const reduced = useReducedMotion();
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0.02, Math.min(1, progress));
  const offset = c * (1 - clamped);

  const trackColor = onMesh ? "rgba(255,255,255,0.22)" : "#E9EDF7";
  const ink = onMesh ? "#FFFFFF" : t.text;
  const sub = onMesh ? "rgba(255,255,255,0.85)" : t.sub;
  const muted = onMesh ? "rgba(255,255,255,0.7)" : t.muted;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ filter: onMesh ? "drop-shadow(0 4px 14px rgba(0,0,0,0.18))" : "none" }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {onMesh ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#EAF0FF" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#5B7CFA" />
                <stop offset="60%" stopColor="#7C6BF0" />
                <stop offset="100%" stopColor="#4FB6F5" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={reduced ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.35 }}
          style={{ fontFamily: t.fontHeading, fontSize: size * 0.3, fontWeight: 700, color: ink, lineHeight: 1, letterSpacing: "-0.03em" }}
        >
          {days}
        </motion.div>
        <div style={{ fontSize: 13, color: sub, marginTop: 6, fontWeight: 500 }}>{days === 1 ? "Day" : "Days"}</div>
        <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}
