"use client";

import { useState } from "react";

interface TaskCardProps {
  task: {
    id: string;
    label: string;
    duration: number;
    category: string;
    icon: string;
  };
  onStart: (task: any) => void;
  completed: boolean;
}

export function TaskCard({ task, onStart, completed }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => !completed && onStart(task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: completed ? "#2FBE6E22" : "#FFFFFF",
        border: `1px solid ${completed ? "#2FBE6E44" : "#1E1E24"}`,
        borderRadius: 12,
        padding: "clamp(12px, 4vw, 16px) clamp(14px, 4.5vw, 18px)",
        cursor: completed ? "default" : "pointer",
        transition: "all 0.2s ease",
        transform: isHovered && !completed ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered && !completed ? "0 4px 20px rgba(24,168,86,0.15)" : "none",
        opacity: completed ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: "clamp(20px, 6vw, 24px)" }}>{task.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(14px, 4vw, 16px)",
            color: completed ? "#2FBE6E" : "#1C2333",
            fontWeight: 500,
            marginBottom: 4,
          }}>
            {task.label}
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(11px, 3vw, 12px)",
            color: "#5A6478",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>{Math.floor(task.duration / 60)}m {task.duration % 60}s</span>
            {completed && <span style={{ color: "#2FBE6E" }}>✓ Completed</span>}
          </div>
        </div>
        {!completed && (
          <div style={{
            fontSize: "clamp(16px, 5vw, 18px)",
            color: "#5A6478",
            transition: "color 0.2s ease",
            ...(isHovered && { color: "#2FBE6E" }),
          }}>
            →
          </div>
        )}
      </div>
    </div>
  );
}