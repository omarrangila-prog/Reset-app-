"use client";

import { CSSProperties } from "react";
import { t } from "./theme";

/**
 * Glass skeleton loaders — the app should always feel alive, never show
 * "Loading…" text. A soft shimmer sweeps across placeholder shapes.
 */
export function Skeleton({ h = 16, w = "100%", radius = 8, style }: { h?: number; w?: number | string; radius?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className="rz-shimmer"
      style={{ height: h, width: w, borderRadius: radius, ...style }}
    />
  );
}

/** A full skeleton card matching the app's card style. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.rLg, padding: 20, boxShadow: t.shadowSm, marginBottom: 12 }}>
      <Skeleton h={12} w="40%" style={{ marginBottom: 14 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} h={14} w={i === lines - 1 ? "70%" : "100%"} style={{ marginBottom: 10 }} />
      ))}
    </div>
  );
}

/** A pulsing orb placeholder for hero areas. */
export function SkeletonOrb({ size = 200 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="rz-pulse"
      style={{
        width: size, height: size, borderRadius: "50%", margin: "0 auto",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7), rgba(124,107,240,0.25) 70%)",
      }}
    />
  );
}
