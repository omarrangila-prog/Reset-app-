"use client";

import { ReactNode } from "react";
import { t } from "./theme";

/** Compact metric tile (mood / energy / sleep). Icon + label + value. */
export function StatTile({
  icon,
  label,
  value,
  accent = t.accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: t.rMd,
        padding: "14px 12px",
        boxShadow: t.shadowSm,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: `${accent}18`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          marginBottom: 10,
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ fontSize: 11, color: t.muted, marginBottom: 2, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ fontSize: 15, color: t.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
