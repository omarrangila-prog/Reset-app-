"use client";

import { useState } from "react";

/**
 * Renders a hero image if the file exists; if it 404s (not yet generated), it
 * hides itself so the layout stays clean — no broken-image icon. Drop the file
 * into /public/hero/<src> to activate.
 */
export function HeroArt({
  src,
  height = 200,
  radius = 24,
  style,
}: {
  src: string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        boxShadow: "var(--shadow-md)",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
