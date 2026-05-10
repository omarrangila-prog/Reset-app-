const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export type BehavioralMode = "URGE" | "VULNERABILITY" | "RECOVERY";

export interface InterventionResponse {
  message: string;
  mode: BehavioralMode;
  actionSteps: string[];
  urgencyScore: number;
  context: {
    streak: number;
    disciplineScore: number;
  };
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  streak: number;
  longestStreak: number;
  totalUrges: number;
  totalRelapses: number;
  disciplineScore: number;
  createdAt: string;
  logs: LogEntry[];
  triggerPatterns: TriggerPattern[];
  weeklyStats: { urges: number; relapses: number; successes: number };
}

export interface LogEntry {
  id: string;
  type: "URGE" | "RELAPSE" | "SUCCESS" | "CHECK_IN";
  emotion?: string;
  trigger?: string;
  note?: string;
  intensity?: number;
  timestamp: string;
}

export interface TriggerPattern {
  id: string;
  type: string;
  frequency: number;
  lastSeen: string;
}

export interface StreakUpdateResponse {
  streak: number;
  longestStreak: number;
  disciplineScore: number;
  totalRelapses?: number;
  message: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Coach
  intervene: (
    userId: string,
    message: string,
    urgencyScore: number = 5
  ): Promise<InterventionResponse> =>
    apiFetch("/api/coach/intervene", {
      method: "POST",
      body: JSON.stringify({ userId, message, urgencyScore }),
    }),

  // Streak
  incrementStreak: (userId: string): Promise<StreakUpdateResponse> =>
    apiFetch("/api/streak/update", {
      method: "POST",
      body: JSON.stringify({ userId, action: "increment" }),
    }),

  resetStreak: (
    userId: string,
    reason?: string
  ): Promise<StreakUpdateResponse> =>
    apiFetch("/api/streak/update", {
      method: "POST",
      body: JSON.stringify({ userId, action: "reset", reason }),
    }),

  // Logs
  createLog: (data: {
    userId: string;
    type: "URGE" | "RELAPSE" | "SUCCESS" | "CHECK_IN";
    emotion?: string;
    trigger?: string;
    note?: string;
    intensity?: number;
  }): Promise<LogEntry> =>
    apiFetch("/api/log", { method: "POST", body: JSON.stringify(data) }),

  logTrigger: (
    userId: string,
    triggerType: string
  ): Promise<TriggerPattern> =>
    apiFetch("/api/log/trigger", {
      method: "POST",
      body: JSON.stringify({ userId, triggerType }),
    }),

  getLogs: (userId: string, limit = 20): Promise<LogEntry[]> =>
    apiFetch(`/api/log/${userId}?limit=${limit}`),

  // User
  createUser: (data: { email?: string; name?: string }): Promise<UserProfile> =>
    apiFetch("/api/user", { method: "POST", body: JSON.stringify(data) }),

  getUser: (userId: string): Promise<UserProfile> =>
    apiFetch(`/api/user/${userId}`),

  getAnalytics: (userId: string) =>
    apiFetch<{
      streak: number;
      longestStreak: number;
      disciplineScore: number;
      totalUrges: number;
      totalRelapses: number;
      triggerPatterns: TriggerPattern[];
      dailyActivity: Array<{
        date: string;
        urges: number;
        successes: number;
        relapses: number;
      }>;
    }>(`/api/user/${userId}/analytics`),
};
