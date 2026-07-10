/**
 * Persistent data store — SQLite-backed via better-sqlite3.
 *
 * Data survives server restarts (written to a real file on disk). The public
 * surface is unchanged and synchronous, so all API routes keep working without
 * edits. File location is configurable via SQLITE_PATH (default ./data/reset.db).
 *
 * NOTE: SQLite needs a persistent disk. Works on a single always-on server
 * (Railway/Render/Fly with a volume) — NOT on Vercel serverless (no disk).
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

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

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  accent: string;
  streak: number;
  lastDoneDate: string | null; // YYYY-MM-DD (local day the habit was last completed)
  createdAt: Date;
}

// ── Database bootstrap (singleton across hot reloads) ──
const g = globalThis as unknown as { __resetDb?: Database.Database };

function initDb(): Database.Database {
  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "reset.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      deviceKeyHash TEXT UNIQUE,
      streak INTEGER DEFAULT 0,
      longestStreak INTEGER DEFAULT 0,
      totalUrges INTEGER DEFAULT 0,
      totalRelapses INTEGER DEFAULT 0,
      disciplineScore INTEGER DEFAULT 0,
      streakStartDate INTEGER,
      lastStreakDate INTEGER,
      timezone TEXT DEFAULT 'UTC',
      lastActiveAt INTEGER,
      createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      emotion TEXT,
      trigger TEXT,
      note TEXT,
      intensity INTEGER,
      timestamp INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_logs_user_ts ON logs(userId, timestamp);
    CREATE TABLE IF NOT EXISTS journal (
      id TEXT PRIMARY KEY,
      userId TEXT,
      content TEXT,
      mood TEXT,
      createdAt INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_journal_user ON journal(userId, createdAt);
    CREATE TABLE IF NOT EXISTS triggers (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      frequency INTEGER DEFAULT 1,
      lastSeen INTEGER,
      createdAt INTEGER,
      UNIQUE(userId, type)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT,
      mode TEXT,
      startedAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      icon TEXT,
      accent TEXT,
      streak INTEGER DEFAULT 0,
      lastDoneDate TEXT,
      createdAt INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(userId, createdAt);
  `);
  return db;
}

// Lazy: only open the DB on first actual use, so importing this module during
// Next's build-time page-data collection never touches the filesystem.
const db: Database.Database = new Proxy({} as Database.Database, {
  get(_t, prop) {
    const real = g.__resetDb ?? (g.__resetDb = initDb());
    // @ts-expect-error dynamic proxy forward
    const val = real[prop];
    return typeof val === "function" ? val.bind(real) : val;
  },
});

// ── Helpers: dates stored as unix-ms integers ──
const toMs = (d: Date | null | undefined) => (d ? d.getTime() : null);
const toDate = (n: number | null | undefined) => (n != null ? new Date(n) : null);

let counter = 0;
export function id(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

function rowToUser(r: any): User {
  return {
    id: r.id,
    deviceKeyHash: r.deviceKeyHash,
    streak: r.streak,
    longestStreak: r.longestStreak,
    totalUrges: r.totalUrges,
    totalRelapses: r.totalRelapses,
    disciplineScore: r.disciplineScore,
    streakStartDate: toDate(r.streakStartDate),
    lastStreakDate: toDate(r.lastStreakDate),
    timezone: r.timezone,
    lastActiveAt: toDate(r.lastActiveAt),
    createdAt: toDate(r.createdAt) ?? new Date(),
  };
}
const rowToLog = (r: any): LogEntry => ({
  id: r.id, userId: r.userId, type: r.type, emotion: r.emotion, trigger: r.trigger,
  note: r.note, intensity: r.intensity, timestamp: toDate(r.timestamp) ?? new Date(),
});
const rowToJournal = (r: any): JournalEntry => ({
  id: r.id, userId: r.userId, content: r.content, mood: r.mood, createdAt: toDate(r.createdAt) ?? new Date(),
});
const rowToTrigger = (r: any): TriggerPattern => ({
  id: r.id, userId: r.userId, type: r.type, frequency: r.frequency,
  lastSeen: toDate(r.lastSeen) ?? new Date(), createdAt: toDate(r.createdAt) ?? new Date(),
});

export const store = {
  // ── users ──
  getUser(userId: string): User | undefined {
    const r = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    return r ? rowToUser(r) : undefined;
  },
  getUserByKey(keyHash: string): User | undefined {
    const r = db.prepare("SELECT * FROM users WHERE deviceKeyHash = ?").get(keyHash);
    return r ? rowToUser(r) : undefined;
  },
  upsertUserByKey(keyHash: string, timezone: string): User {
    const existing = this.getUserByKey(keyHash);
    if (existing) {
      db.prepare("UPDATE users SET lastActiveAt = ?, timezone = ? WHERE id = ?")
        .run(Date.now(), timezone, existing.id);
      return this.getUser(existing.id)!;
    }
    const now = Date.now();
    const uid = id("usr");
    db.prepare(
      `INSERT INTO users (id, deviceKeyHash, timezone, lastActiveAt, createdAt)
       VALUES (?, ?, ?, ?, ?)`
    ).run(uid, keyHash, timezone, now, now);
    return this.getUser(uid)!;
  },
  updateUser(userId: string, patch: Partial<User>): User | undefined {
    const cur = this.getUser(userId);
    if (!cur) return undefined;
    const merged = { ...cur, ...patch };
    db.prepare(
      `UPDATE users SET streak=?, longestStreak=?, totalUrges=?, totalRelapses=?,
        disciplineScore=?, streakStartDate=?, lastStreakDate=?, timezone=?, lastActiveAt=?
       WHERE id=?`
    ).run(
      merged.streak, merged.longestStreak, merged.totalUrges, merged.totalRelapses,
      merged.disciplineScore, toMs(merged.streakStartDate), toMs(merged.lastStreakDate),
      merged.timezone, toMs(merged.lastActiveAt), userId
    );
    return this.getUser(userId);
  },
  deleteUser(userId: string): void {
    const tx = db.transaction((uid: string) => {
      db.prepare("DELETE FROM logs WHERE userId = ?").run(uid);
      db.prepare("DELETE FROM journal WHERE userId = ?").run(uid);
      db.prepare("DELETE FROM triggers WHERE userId = ?").run(uid);
      db.prepare("DELETE FROM sessions WHERE userId = ?").run(uid);
      db.prepare("DELETE FROM users WHERE id = ?").run(uid);
    });
    tx(userId);
  },

  // ── logs ──
  createLog(data: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: Date }): LogEntry {
    const entry: LogEntry = {
      id: id("log"), timestamp: data.timestamp ?? new Date(), userId: data.userId, type: data.type,
      emotion: data.emotion ?? null, trigger: data.trigger ?? null, note: data.note ?? null,
      intensity: data.intensity ?? null,
    };
    db.prepare(
      `INSERT INTO logs (id, userId, type, emotion, trigger, note, intensity, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(entry.id, entry.userId, entry.type, entry.emotion, entry.trigger, entry.note, entry.intensity, entry.timestamp.getTime());
    return entry;
  },
  listLogs(userId: string, opts?: { type?: LogType; limit?: number }): LogEntry[] {
    const clause = opts?.type ? "AND type = ?" : "";
    const args: any[] = opts?.type ? [userId, opts.type] : [userId];
    const limit = opts?.limit ? ` LIMIT ${Math.max(1, Math.min(1000, opts.limit))}` : "";
    const rows = db.prepare(
      `SELECT * FROM logs WHERE userId = ? ${clause} ORDER BY timestamp DESC${limit}`
    ).all(...args);
    return rows.map(rowToLog);
  },
  countLogsSince(userId: string, since: Date): number {
    const r = db.prepare("SELECT COUNT(*) c FROM logs WHERE userId = ? AND timestamp >= ?")
      .get(userId, since.getTime()) as { c: number };
    return r.c;
  },

  // ── journal ──
  createJournal(userId: string, content: string, mood: string | null): JournalEntry {
    const entry: JournalEntry = { id: id("jrn"), userId, content, mood, createdAt: new Date() };
    db.prepare("INSERT INTO journal (id, userId, content, mood, createdAt) VALUES (?, ?, ?, ?, ?)")
      .run(entry.id, userId, content, mood, entry.createdAt.getTime());
    return entry;
  },
  listJournal(userId: string, limit = 30): JournalEntry[] {
    const rows = db.prepare(
      `SELECT * FROM journal WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`
    ).all(userId, Math.max(1, Math.min(1000, limit)));
    return rows.map(rowToJournal);
  },

  // ── triggers ──
  upsertTrigger(userId: string, type: TriggerType): TriggerPattern {
    const found = db.prepare("SELECT * FROM triggers WHERE userId = ? AND type = ?").get(userId, type);
    if (found) {
      db.prepare("UPDATE triggers SET frequency = frequency + 1, lastSeen = ? WHERE userId = ? AND type = ?")
        .run(Date.now(), userId, type);
      return rowToTrigger(db.prepare("SELECT * FROM triggers WHERE userId = ? AND type = ?").get(userId, type));
    }
    const now = Date.now();
    const tid = id("trg");
    db.prepare("INSERT INTO triggers (id, userId, type, frequency, lastSeen, createdAt) VALUES (?, ?, ?, 1, ?, ?)")
      .run(tid, userId, type, now, now);
    return rowToTrigger(db.prepare("SELECT * FROM triggers WHERE id = ?").get(tid));
  },
  listTriggers(userId: string): TriggerPattern[] {
    const rows = db.prepare("SELECT * FROM triggers WHERE userId = ? ORDER BY frequency DESC").all(userId);
    return rows.map(rowToTrigger);
  },

  /**
   * Seed a realistic 2-week history so a brand-new account never looks empty.
   * `encJournal` is a caller-provided function that encrypts journal content
   * (keeps this module free of crypto imports). Idempotent: only seeds once.
   */
  seedDemoData(userId: string, encJournal: (s: string) => string): void {
    const already = db.prepare("SELECT COUNT(*) c FROM logs WHERE userId = ?").get(userId) as { c: number };
    if (already.c > 0) return;

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const insLog = db.prepare(
      "INSERT INTO logs (id, userId, type, emotion, trigger, note, intensity, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const moods = ["Calm", "Calm", "Anxious", "Tired", "Happy", "Neutral", "Calm", "Low", "Happy", "Anxious", "Calm", "Tired"];

    const seed = db.transaction(() => {
      // 12 days of activity: a daily check-in win, a few urges faced, mood logs.
      for (let d = 12; d >= 1; d--) {
        const ts = now - d * DAY;
        insLog.run(id("log"), userId, "SUCCESS", null, null, null, null, ts + 8 * 3600e3);
        insLog.run(id("log"), userId, "CHECK_IN", moods[d % moods.length], null, null, null, ts + 9 * 3600e3);
        // Some late-night urges (drives the "late night" insight).
        if (d % 3 === 0) insLog.run(id("log"), userId, "URGE", null, null, null, 6, ts + 23.5 * 3600e3);
        if (d % 5 === 0) insLog.run(id("log"), userId, "URGE", null, null, null, 4, ts + 15 * 3600e3);
      }

      // Trigger patterns.
      const trig: [TriggerType, number][] = [["LATE_NIGHT", 5], ["STRESS", 3], ["BOREDOM", 2], ["LONELINESS", 1]];
      const insTrig = db.prepare("INSERT INTO triggers (id, userId, type, frequency, lastSeen, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
      trig.forEach(([type, freq]) => insTrig.run(id("trg"), userId, type, freq, now, now - 12 * DAY));

      // A few warm journal entries (encrypted).
      const entries = [
        "First day trying this. Feeling nervous but hopeful. One step at a time.",
        "Made it through a tough evening by going for a walk instead. Small win.",
        "Slept better last night and the whole day felt easier. Noting that.",
        "Reached out to a friend today. Felt good to not be in my head so much.",
      ];
      const insJ = db.prepare("INSERT INTO journal (id, userId, content, mood, createdAt) VALUES (?, ?, ?, ?, ?)");
      entries.forEach((e, i) => insJ.run(id("jrn"), userId, encJournal(e), null, now - (10 - i * 2) * DAY));

      // Set a believable streak + score + totals on the user.
      db.prepare(
        `UPDATE users SET streak = 12, longestStreak = 12, totalUrges = 6, totalRelapses = 0,
          disciplineScore = 68, lastStreakDate = ?, streakStartDate = ? WHERE id = ?`
      ).run(now - DAY, now - 12 * DAY, userId);
    });
    seed();
  },

  // ── sessions ──
  createSession(userId: string, mode: SessionMode): SessionRow {
    const s: SessionRow = { id: id("ses"), userId, mode, startedAt: new Date() };
    db.prepare("INSERT INTO sessions (id, userId, mode, startedAt) VALUES (?, ?, ?, ?)")
      .run(s.id, userId, mode, s.startedAt.getTime());
    return s;
  },

  // ── habits ──
  listHabits(userId: string): Habit[] {
    const rows = db.prepare("SELECT * FROM habits WHERE userId = ? ORDER BY createdAt ASC").all(userId) as any[];
    return rows.map((r) => ({
      id: r.id, userId: r.userId, name: r.name, icon: r.icon, accent: r.accent,
      streak: r.streak, lastDoneDate: r.lastDoneDate, createdAt: toDate(r.createdAt) ?? new Date(),
    }));
  },
  createHabit(userId: string, name: string, icon: string, accent: string): Habit {
    const h: Habit = { id: id("hab"), userId, name, icon, accent, streak: 0, lastDoneDate: null, createdAt: new Date() };
    db.prepare("INSERT INTO habits (id, userId, name, icon, accent, streak, lastDoneDate, createdAt) VALUES (?, ?, ?, ?, ?, 0, NULL, ?)")
      .run(h.id, userId, name, icon, accent, h.createdAt.getTime());
    return h;
  },
  /** Toggle a habit's completion for `today` (YYYY-MM-DD). Streak-aware. */
  toggleHabit(userId: string, habitId: string, today: string): Habit | undefined {
    const r = db.prepare("SELECT * FROM habits WHERE id = ? AND userId = ?").get(habitId, userId) as any;
    if (!r) return undefined;
    let streak = r.streak as number;
    let lastDone: string | null = r.lastDoneDate;
    if (lastDone === today) {
      // Un-complete today: undo the increment.
      streak = Math.max(0, streak - 1);
      lastDone = null;
    } else {
      // Complete today: +1 (streak logic kept simple/honest).
      streak = streak + 1;
      lastDone = today;
    }
    db.prepare("UPDATE habits SET streak = ?, lastDoneDate = ? WHERE id = ?").run(streak, lastDone, habitId);
    return this.listHabits(userId).find((h) => h.id === habitId);
  },
  deleteHabit(userId: string, habitId: string): void {
    db.prepare("DELETE FROM habits WHERE id = ? AND userId = ?").run(habitId, userId);
  },
  /** Create a starter set on first visit so the screen is never empty. */
  seedHabitsIfEmpty(userId: string): Habit[] {
    const existing = this.listHabits(userId);
    if (existing.length > 0) return existing;
    const defaults = [
      { name: "15-minute walk", icon: "walk", accent: "#34C9A3" },
      { name: "Morning reflection", icon: "reflect", accent: "#5B7CFA" },
      { name: "Sleep before 11 PM", icon: "sleep", accent: "#7C6BF0" },
    ];
    defaults.forEach((d) => this.createHabit(userId, d.name, d.icon, d.accent));
    return this.listHabits(userId);
  },
};
