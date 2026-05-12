"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── TASK LIBRARY ─────────────────────────────────────────────────────────────
const taskLibrary = {
  physical: [
    { id: "drink_water", label: "Drink a full glass of water", duration: 30, category: "physical", icon: "💧" },
    { id: "stand_up", label: "Stand up and stretch", duration: 60, category: "physical", icon: "🧍" },
    { id: "push_ups", label: "Do 10 push-ups", duration: 120, category: "physical", icon: "💪" },
    { id: "cold_face", label: "Splash cold water on face", duration: 45, category: "physical", icon: "❄️" },
    { id: "go_outside", label: "Step outside for fresh air", duration: 180, category: "physical", icon: "🌤️" },
    { id: "stretch", label: "Full body stretch routine", duration: 90, category: "physical", icon: "🤸" },
  ],
  mental: [
    { id: "box_breathing", label: "Box breathing exercise", duration: 120, category: "mental", icon: "🫁" },
    { id: "name_emotion", label: "Name your current emotion", duration: 60, category: "mental", icon: "🧠" },
    { id: "journal", label: "Write in journal for 5 minutes", duration: 300, category: "mental", icon: "📝" },
    { id: "54321", label: "5-4-3-2-1 grounding technique", duration: 90, category: "mental", icon: "👀" },
    { id: "future_self", label: "Write a letter to future self", duration: 180, category: "mental", icon: "📨" },
    { id: "focus_sprint", label: "25-minute focus sprint", duration: 1500, category: "mental", icon: "⏱️" },
  ],
  environment: [
    { id: "phone_away", label: "Put phone in another room", duration: 300, category: "environment", icon: "📱" },
    { id: "open_window", label: "Open a window for fresh air", duration: 30, category: "environment", icon: "🪟" },
    { id: "lights_on", label: "Turn on bright lights", duration: 15, category: "environment", icon: "💡" },
    { id: "clean_surface", label: "Clean your immediate surface", duration: 120, category: "environment", icon: "🧽" },
    { id: "text_someone", label: "Text a friend or family member", duration: 180, category: "environment", icon: "💬" },
  ],
};

import { TaskCard } from "../../components/TaskCard";

// ─── TIMER MODAL ─────────────────────────────────────────────────────────────
type Task = {
  id: string;
  label: string;
  duration: number;
  category: string;
  icon: string;
};

function TimerModal({ task, onComplete, onCancel }: {
  task: Task;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(task.duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((task.duration - timeLeft) / task.duration) * 100;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(8,8,9,0.95)",
      backdropFilter: "blur(20px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(20px, 6vw, 24px)",
    }}>
      <div style={{
        background: "#151518",
        border: "1px solid #1E1E24",
        borderRadius: 20,
        padding: "clamp(24px, 8vw, 32px)",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{task.icon}</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(24px, 8vw, 32px)",
          color: "#EDEDEB",
          marginBottom: 8,
        }}>
          {task.label.toUpperCase()}
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(12px, 3.5vw, 14px)",
          color: "#7A7A80",
          marginBottom: 32,
        }}>
          {task.category} task
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 48,
            color: "#18A856",
            marginBottom: 16,
          }}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div style={{
            height: 4,
            background: "#1E1E24",
            borderRadius: 99,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "#18A856",
              borderRadius: 99,
              width: `${progress}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #1E1E24",
              borderRadius: 12,
              padding: "14px",
              color: "#7A7A80",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              flex: 1,
              background: isRunning ? "#E8352C" : "#18A856",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              color: "#F5F5F3",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TASKS PAGE ─────────────────────────────────────────────────────────
export default function TasksPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("physical");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const categories = [
    { id: "physical", label: "Physical", count: taskLibrary.physical.length },
    { id: "mental", label: "Mental", count: taskLibrary.mental.length },
    { id: "environment", label: "Environment", count: taskLibrary.environment.length },
  ];

  const currentTasks = taskLibrary[activeCategory as keyof typeof taskLibrary];

  const handleStartTask = (task: Task) => {
    setActiveTask(task);
  };

  const handleCompleteTask = () => {
    if (activeTask) {
      setCompletedTasks(prev => new Set([...prev, activeTask.id]));
      setActiveTask(null);
      // Here you would typically send completion to backend
    }
  };

  const handleCancelTask = () => {
    setActiveTask(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080809",
      color: "#EDEDEB",
      fontFamily: "'DM Sans', sans-serif",
      padding: "80px 24px 24px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 600, margin: "0 auto", marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#7A7A80",
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Back
        </button>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 48,
          letterSpacing: "0.02em",
          marginBottom: 8,
        }}>
          TASKS
        </div>
        <div style={{
          fontSize: 16,
          color: "#7A7A80",
          lineHeight: 1.5,
        }}>
          Behavioral interruption tasks to break compulsive patterns and build discipline.
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        maxWidth: 600,
        margin: "0 auto 24px",
        display: "flex",
        gap: 8,
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              flex: 1,
              background: activeCategory === cat.id ? "#18A85622" : "transparent",
              border: `1px solid ${activeCategory === cat.id ? "#18A85644" : "#1E1E24"}`,
              borderRadius: 12,
              padding: "12px 16px",
              color: activeCategory === cat.id ? "#18A856" : "#EDEDEB",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div>{cat.label}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{cat.count} tasks</div>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {currentTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onStart={handleStartTask}
            completed={completedTasks.has(task.id)}
          />
        ))}
      </div>

      {/* Timer Modal */}
      {activeTask && (
        <TimerModal
          task={activeTask}
          onComplete={handleCompleteTask}
          onCancel={handleCancelTask}
        />
      )}
    </div>
  );
}