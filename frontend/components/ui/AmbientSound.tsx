"use client";

import { useEffect, useRef, useState } from "react";
import { Wind, CloudRain, Trees, Waves, VolumeX } from "lucide-react";
import { haptic } from "@/lib/haptics";

/**
 * Ambient sound — opt-in, calm background loops. Never autoplays; only starts on
 * an explicit tap (browser autoplay policy + our own rule). Persists the choice.
 * Gracefully degrades: if an audio file isn't present yet, the control shows a
 * gentle "coming soon" state instead of erroring. Files live in public/audio/.
 */
const SOUNDS = [
  { id: "wind", label: "Wind", Icon: Wind, src: "/audio/wind.m4a" },
  { id: "rain", label: "Rain", Icon: CloudRain, src: "/audio/rain.m4a" },
  { id: "forest", label: "Forest", Icon: Trees, src: "/audio/forest.m4a" },
  { id: "ocean", label: "Ocean", Icon: Waves, src: "/audio/ocean.m4a" },
];
const KEY = "reset_ambient_sound";

export function AmbientSound() {
  const [active, setActive] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActive(null);
    try { localStorage.removeItem(KEY); } catch {}
    haptic("tap");
  };

  const play = (s: typeof SOUNDS[number]) => {
    haptic("select");
    if (active === s.id) { stop(); return; }
    audioRef.current?.pause();
    const a = new Audio(s.src);
    a.loop = true;
    a.volume = 0.5;
    a.play()
      .then(() => { audioRef.current = a; setActive(s.id); setUnavailable(false); try { localStorage.setItem(KEY, s.id); } catch {} })
      .catch(() => {
        // File missing (404) or blocked — degrade gracefully, don't crash.
        setUnavailable(true);
        setActive(null);
      });
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Ambient sound">
        {SOUNDS.map((s) => {
          const on = active === s.id;
          return (
            <button key={s.id} onClick={() => play(s)} aria-pressed={on}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 999, minHeight: 44, cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                background: on ? "var(--accent-soft)" : "var(--bg-surface)", border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`, color: on ? "var(--accent-text)" : "var(--text)" }}>
              <s.Icon size={16} color={on ? "var(--accent)" : "var(--text-muted)"} /> {s.label}
            </button>
          );
        })}
        {active && (
          <button onClick={stop} aria-label="Stop ambient sound"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 999, minHeight: 44, cursor: "pointer", fontSize: 13.5, fontWeight: 600, background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <VolumeX size={16} /> Off
          </button>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
        {unavailable
          ? "Ambient sounds are coming soon — audio isn’t available in this build yet."
          : "Soft loops to help you settle. Nothing plays until you choose — and it never starts on its own."}
      </p>
    </div>
  );
}
