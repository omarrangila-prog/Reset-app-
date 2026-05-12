"use client";

import { useState } from "react";

interface MentalWeatherProps {
  current: number;
  onChange: (index: number) => void;
}

const weatherStates = [
  { label: "Stable", icon: "○", color: "#18A856", bg: "rgba(24,168,86,0.06)" },
  { label: "Foggy", icon: "◌", color: "#7A7A80", bg: "rgba(122,122,128,0.06)" },
  { label: "Restless", icon: "◎", color: "#E8A020", bg: "rgba(232,160,32,0.06)" },
  { label: "Triggered", icon: "●", color: "#E8352C", bg: "rgba(232,53,44,0.06)" },
];

export function MentalWeather({ current, onChange }: MentalWeatherProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {weatherStates.map((w, i) => (
        <button
          key={w.label}
          onClick={() => onChange(i)}
          style={{
            flex: 1,
            padding: "10px 8px",
            background: current === i ? w.bg : "transparent",
            border: `1px solid ${current === i ? w.color + "44" : "#1E1E24"}`,
            borderRadius: 10,
            cursor: "pointer",
            transition: "all 0.25s ease",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 4, color: current === i ? w.color : "#3A3A40" }}>
            {w.icon}
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: current === i ? w.color : "#3A3A40",
            letterSpacing: "0.05em"
          }}>
            {w.label}
          </div>
        </button>
      ))}
    </div>
  );
}