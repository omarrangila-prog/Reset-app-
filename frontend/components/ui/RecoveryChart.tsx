"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { TooltipProps } from "recharts";

/**
 * Apple-Health-style recovery chart: soft glass container, animated gradient
 * area fill, smooth monotone curve, glowing data points, subtle grid, and a
 * dark-aware glass tooltip. Theme-aware via CSS vars.
 */
interface Point { day: string; wins: number; urges: number }

function GlassTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-glass-strong)", backdropFilter: "blur(14px) saturate(140%)",
      border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", boxShadow: "var(--shadow-lg)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function RecoveryChart({ data }: { data: Point[] }) {
  return (
    <div style={{ background: "var(--bg-glass)", backdropFilter: "blur(20px) saturate(130%)", WebkitBackdropFilter: "blur(20px) saturate(130%)",
      border: "1px solid var(--border)", borderRadius: 22, padding: "18px 14px 10px", boxShadow: "var(--shadow-md)" }}>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="winsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--recovery)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--recovery)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="urgesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" opacity={0.5} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={18} />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="urges" name="Difficult moments" stroke="var(--accent)" strokeWidth={2} fill="url(#urgesFill)"
            dot={false} activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--bg-surface)", strokeWidth: 2 }} animationDuration={1100} />
          <Area type="monotone" dataKey="wins" name="Got through" stroke="var(--recovery)" strokeWidth={2.5} fill="url(#winsFill)"
            dot={false} activeDot={{ r: 5, fill: "var(--recovery)", stroke: "var(--bg-surface)", strokeWidth: 2 }} animationDuration={1100} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
