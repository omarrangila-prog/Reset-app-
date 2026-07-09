/**
 * API client. All requests are same-origin (Next.js API routes) and rely on the
 * httpOnly session cookie for auth — the client never sends or knows a userId.
 */

export type BehavioralMode = "URGE" | "VULNERABILITY" | "RECOVERY";

export interface InterventionResponse {
  message: string;
  mode: BehavioralMode | "CRISIS";
  actionSteps: string[];
  urgencyScore?: number;
  crisis?: boolean;
  resources?: Array<{ label: string; value: string; href: string }>;
  context: { streak: number; disciplineScore?: number };
  fallback?: boolean;
}

export interface LogEntry {
  id: string;
  type: "URGE" | "RELAPSE" | "SUCCESS" | "CHECK_IN";
  emotion?: string | null;
  trigger?: string | null;
  note?: string | null;
  intensity?: number | null;
  timestamp: string;
}

export interface TriggerPattern {
  id: string;
  type: string;
  frequency: number;
  lastSeen: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood?: string | null;
  createdAt: string;
}

export interface MeProfile {
  id: string;
  streak: number;
  longestStreak: number;
  totalUrges: number;
  totalRelapses: number;
  disciplineScore: number;
  momentum: string;
  timezone: string;
  createdAt: string;
  weeklyStats: { urges: number; relapses: number; successes: number };
  triggerPatterns: TriggerPattern[];
  logs: LogEntry[];
  dailyActivity: Array<{ date: string; urges: number; successes: number; relapses: number }>;
}

export interface StreakUpdateResponse {
  streak: number;
  longestStreak: number;
  disciplineScore: number;
  totalRelapses?: number;
  alreadyCheckedInToday?: boolean;
  message: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  getSession: (): Promise<{ authenticated: boolean; userId?: string }> =>
    apiFetch("/api/auth/session"),
  register: (payload: {
    publicKey: string;
    nonce: string;
    signature: string;
    timezone?: string;
  }): Promise<{ ok: boolean; userId: string }> =>
    apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  logout: (): Promise<{ ok: boolean }> =>
    apiFetch("/api/auth/session", { method: "DELETE" }),

  // Profile + analytics
  getMe: (): Promise<MeProfile> => apiFetch("/api/me"),

  // Coach
  intervene: (message: string, urgencyScore = 5): Promise<InterventionResponse> =>
    apiFetch("/api/coach/intervene", {
      method: "POST",
      body: JSON.stringify({ message, urgencyScore }),
    }),

  // Streak
  checkIn: (): Promise<StreakUpdateResponse> =>
    apiFetch("/api/streak/update", { method: "POST", body: JSON.stringify({ action: "checkin" }) }),
  logRelapse: (reason?: string): Promise<StreakUpdateResponse> =>
    apiFetch("/api/streak/update", {
      method: "POST",
      body: JSON.stringify({ action: "relapse", reason }),
    }),

  // Logs
  createLog: (data: {
    type: "URGE" | "RELAPSE" | "SUCCESS" | "CHECK_IN";
    emotion?: string;
    trigger?: string;
    note?: string;
    intensity?: number;
  }): Promise<LogEntry> =>
    apiFetch("/api/log", { method: "POST", body: JSON.stringify(data) }),
  getLogs: (limit = 20): Promise<LogEntry[]> => apiFetch(`/api/log?limit=${limit}`),
  logTrigger: (triggerType: string): Promise<TriggerPattern> =>
    apiFetch("/api/log/trigger", { method: "POST", body: JSON.stringify({ triggerType }) }),

  // Journal
  createJournal: (content: string, mood?: string): Promise<JournalEntry> =>
    apiFetch("/api/journal", { method: "POST", body: JSON.stringify({ content, mood }) }),
  getJournal: (limit = 30): Promise<JournalEntry[]> => apiFetch(`/api/journal?limit=${limit}`),

  // Account
  deleteAccount: (): Promise<{ ok: boolean; deleted: boolean }> =>
    apiFetch("/api/account", { method: "DELETE" }),
  exportUrl: "/api/account/export",
};
