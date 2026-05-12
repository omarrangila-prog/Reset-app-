"use client";

import { useState, useEffect, useRef } from "react";

interface BreathingOrbProps {
  mode: "URGE" | "VULNERABILITY" | "RECOVERY";
  size?: number;
  active?: boolean;
}

export function BreathingOrb({ mode, size = 160, active = true }: BreathingOrbProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [scale, setScale] = useState(0.85);
  const phaseRef = useRef<"inhale" | "hold" | "exhale">("inhale");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const timing = mode === "URGE"
    ? { inhale: 3500, hold: 1500, exhale: 5000 }
    : mode === "VULNERABILITY"
    ? { inhale: 4000, hold: 2000, exhale: 6000 }
    : { inhale: 4500, hold: 2000, exhale: 6500 };

  useEffect(() => {
    if (!active) return;
    const cycle = () => {
      phaseRef.current = "inhale";
      setPhase("inhale");
      setScale(1.18);
      timerRef.current = setTimeout(() => {
        phaseRef.current = "hold";
        setPhase("hold");
        timerRef.current = setTimeout(() => {
          phaseRef.current = "exhale";
          setPhase("exhale");
          setScale(0.75);
          timerRef.current = setTimeout(cycle, timing.exhale);
        }, timing.hold);
      }, timing.inhale);
    };
    cycle();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [mode, active, timing.inhale, timing.hold, timing.exhale]);

  const color = mode === "URGE" ? "#E8352C" : mode === "VULNERABILITY" ? "#E8A020" : "#18A856";
  const phaseLabel = phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out";
  const phaseDuration = phase === "inhale" ? timing.inhale : phase === "hold" ? timing.hold : timing.exhale;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Outer ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid ${color}22`,
          transform: `scale(${scale * 1.18})`,
          transition: `transform ${phaseDuration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
        }} />
        {/* Mid ring */}
        <div style={{
          position: "absolute", inset: "10%", borderRadius: "50%",
          border: `1px solid ${color}33`,
          transform: `scale(${scale * 1.08})`,
          transition: `transform ${phaseDuration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
        }} />
        {/* Core orb */}
        <div style={{
          position: "absolute", inset: "20%", borderRadius: "50%",
          background: `radial-gradient(circle at 38% 38%, ${color}55, ${color}18 60%, transparent)`,
          border: `1px solid ${color}44`,
          backdropFilter: "blur(8px)",
          transform: `scale(${scale})`,
          transition: `transform ${phaseDuration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
          boxShadow: `0 0 ${size * 0.3}px ${color}22, inset 0 0 ${size * 0.15}px ${color}18`,
        }} />
        {/* Inner glow */}
        <div style={{
          position: "absolute", inset: "35%", borderRadius: "50%",
          background: `radial-gradient(circle, ${color}40, transparent 70%)`,
          transform: `scale(${scale * 0.9})`,
          transition: `transform ${phaseDuration}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          letterSpacing: "0.12em",
          color,
          opacity: 0.9,
          textTransform: "uppercase"
        }}>
          {phaseLabel}
        </div>
      </div>
    </div>
  );
}