/**
 * TEMPORARY in-memory data store (no database).
 *
 * ⚠️ IMPORTANT: data lives in process memory only. It resets whenever the
 * server restarts and is NOT shared across serverless instances. This is for
 * demos / getting-started only — swap back to Prisma+Postgres (see git history)
 * before real users depend on persistence.
 *
 * The surface mirrors the small subset of Prisma calls the app actually uses,
 * so routes read almost identically.
 */

export type LogType = "URGE" | "RELAPSE" | "SUCCESS" | "CHECK_IN";
export type SessionMode = "URGE" | "VULNERABILITY" | "RECOVERY";
export type TriggerType =
  | "BOREDOM" | "STRESS" | "LONELINESS" | "ANXIETY" | "ANGER"
  | "SADNESS" | "LATE_NIGHT" | "IDLE_TIME" | "SOCIAL_REJECTION";

export interface User {
  id: string;
  deviceKeyHash: string | null;
  streak: number;
  longestStreak: number;
  totalUrges: number;
  totalRelapses: number;
  disciplineScore: number;
  streakStartDate: Date | null;
  lastStreakDate: Date | null;
  timezone: string;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface LogEntry {
  id: string;
  userId: string;
  type: LogType;
  emotion: string | null;
  trigger: string | null;
  note: string | null;
  intensity: number | null;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: string | null;
  createdAt: Date;
}

export interface TriggerPattern {
  id: string;
  userId: string;
  type: TriggerType;
  frequency: number;
  lastSeen: Date;
  createdAt: Date;
}

export interface SessionRow {
  id: string;
  userId: string;
  mode: SessionMode;
  startedAt: Date;
}

// Persist across hot reloads / route module reloads within one process.
interface MemDb {
  users: Map<string, User>;
  usersByKey: Map<string, string>;
  logs: LogEntry[];
  journal: JournalEntry[];
  triggers: TriggerPattern[];
  sessions: SessionRow[];
}

const g = globalThis as unknown as { __resetMem?: MemDb };

const mem: MemDb =
  g.__resetMem ??
  (g.__resetMem = {
    users: new Map<string, User>(),
    usersByKey: new Map<string, string>(),
    logs: [],
    journal: [],
    triggers: [],
    sessions: [],
  });

let counter = 0;
export function id(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export const store = {
  // --- users ---
  getUser(userId: string): User | undefined {
    return mem.users.get(userId);
  },
  getUserByKey(keyHash: string): User | undefined {
    const uid = mem.usersByKey.get(keyHash);
    return uid ? mem.users.get(uid) : undefined;
  },
  upsertUserByKey(keyHash: string, timezone: string): User {
    const existing = this.getUserByKey(keyHash);
    if (existing) {
      existing.lastActiveAt = new Date();
      existing.timezone = timezone;
      return existing;
    }
    const user: User = {
      id: id("usr"),
      deviceKeyHash: keyHash,
      streak: 0,
      longestStreak: 0,
      totalUrges: 0,
      totalRelapses: 0,
      disciplineScore: 0,
      streakStartDate: null,
      lastStreakDate: null,
      timezone,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };
    mem.users.set(user.id, user);
    mem.usersByKey.set(keyHash, user.id);
    return user;
  },
  updateUser(userId: string, patch: Partial<User>): User | undefined {
    const u = mem.users.get(userId);
    if (!u) return undefined;
    Object.assign(u, patch);
    return u;
  },
  deleteUser(userId: string): void {
    const u = mem.users.get(userId);
    if (u?.deviceKeyHash) mem.usersByKey.delete(u.deviceKeyHash);
    mem.users.delete(userId);
    mem.logs = mem.logs.filter((l) => l.userId !== userId);
    mem.journal = mem.journal.filter((j) => j.userId !== userId);
    mem.triggers = mem.triggers.filter((t) => t.userId !== userId);
    mem.sessions = mem.sessions.filter((s) => s.userId !== userId);
  },

  // --- logs ---
  createLog(data: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: Date }): LogEntry {
    const entry: LogEntry = {
      id: id("log"),
      timestamp: data.timestamp ?? new Date(),
      userId: data.userId,
      type: data.type,
      emotion: data.emotion ?? null,
      trigger: data.trigger ?? null,
      note: data.note ?? null,
      intensity: data.intensity ?? null,
    };
    mem.logs.push(entry);
    return entry;
  },
  listLogs(userId: string, opts?: { type?: LogType; limit?: number }): LogEntry[] {
    let rows = mem.logs
      .filter((l) => l.userId === userId && (!opts?.type || l.type === opts.type))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (opts?.limit) rows = rows.slice(0, opts.limit);
    return rows;
  },
  countLogsSince(userId: string, since: Date): number {
    return mem.logs.filter((l) => l.userId === userId && l.timestamp >= since).length;
  },

  // --- journal ---
  createJournal(userId: string, content: string, mood: string | null): JournalEntry {
    const entry: JournalEntry = { id: id("jrn"), userId, content, mood, createdAt: new Date() };
    mem.journal.push(entry);
    return entry;
  },
  listJournal(userId: string, limit = 30): JournalEntry[] {
    return mem.journal
      .filter((j) => j.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  // --- triggers ---
  upsertTrigger(userId: string, type: TriggerType): TriggerPattern {
    const found = mem.triggers.find((t) => t.userId === userId && t.type === type);
    if (found) {
      found.frequency += 1;
      found.lastSeen = new Date();
      return found;
    }
    const t: TriggerPattern = {
      id: id("trg"),
      userId,
      type,
      frequency: 1,
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    mem.triggers.push(t);
    return t;
  },
  listTriggers(userId: string): TriggerPattern[] {
    return mem.triggers
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.frequency - a.frequency);
  },

  // --- sessions ---
  createSession(userId: string, mode: SessionMode): SessionRow {
    const s: SessionRow = { id: id("ses"), userId, mode, startedAt: new Date() };
    mem.sessions.push(s);
    return s;
  },
};
