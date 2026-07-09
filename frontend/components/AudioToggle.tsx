"use client";

import { useState, useEffect } from "react";

interface AudioToggleProps {
  audioEngine: any; // Would be properly typed in real implementation
}

export function AudioToggle({ audioEngine }: AudioToggleProps) {
  const [isEnabled, setIsEnabled] = useState(true);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
    if (audioEngine) {
      if (!isEnabled) {
        audioEngine.resume();
      } else {
        // Audio engine would have a mute/disable method
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: "transparent",
        border: `1px solid ${isEnabled ? "#2FBE6E" : "#1E1E24"}`,
        borderRadius: 8,
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{
        fontSize: 16,
        color: isEnabled ? "#2FBE6E" : "#7A7A80",
      }}>
        {isEnabled ? "🔊" : "🔇"}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12,
        color: isEnabled ? "#1C2333" : "#7A7A80",
      }}>
        Audio {isEnabled ? "On" : "Off"}
      </div>
    </button>
  );
}