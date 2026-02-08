// ============================================================
// Daily Win — IndexedDB Storage Layer (with localStorage fallback)
// Uses the `idb` library for a clean Promise-based API.
// Provides a clean upgrade path to Supabase later.
// ============================================================

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  DayEntry,
  StreakState,
  AppSettings,
  ContentData,
  ContentState,
  DateString,
  createBlankDayEntry,
} from './types';

// ── DB Schema ──────────────────────────────────────────────
interface DailyWinDB extends DBSchema {
  entries: {
    key: DateString;
    value: DayEntry;
    indexes: { 'by-date': DateString };
  };
  meta: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'daily-win';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DailyWinDB>> | null = null;

function getDB(): Promise<IDBPDatabase<DailyWinDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DailyWinDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Entries store — keyed by date string
        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'date' });
          store.createIndex('by-date', 'date');
        }
        // Meta store — for settings, streak, content state
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

// ── localStorage Fallback helpers ──────────────────────────
const LS_PREFIX = 'dw_';

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// ── Feature detection ──────────────────────────────────────
let useIndexedDB = true;

async function checkIndexedDB(): Promise<boolean> {
  try {
    await getDB();
    return true;
  } catch {
    useIndexedDB = false;
    return false;
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  checkIndexedDB();
}

// ============================================================
// PUBLIC API — Day Entries
// ============================================================

/** Get a single day entry (or null) */
export async function getEntry(date: DateString): Promise<DayEntry | null> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const entry = await db.get('entries', date);
      return entry ?? null;
    } catch {
      return lsGet<DayEntry | null>(`entry_${date}`, null);
    }
  }
  return lsGet<DayEntry | null>(`entry_${date}`, null);
}

/** Get or create a day entry */
export async function getOrCreateEntry(date: DateString): Promise<DayEntry> {
  const existing = await getEntry(date);
  if (existing) return existing;
  return createBlankDayEntry(date);
}

/** Save a day entry */
export async function saveEntry(entry: DayEntry): Promise<void> {
  entry.updatedAt = Date.now();
  if (useIndexedDB) {
    try {
      const db = await getDB();
      await db.put('entries', entry);
      return;
    } catch {
      // fall through to localStorage
    }
  }
  lsSet(`entry_${entry.date}`, entry);
}

/** Get all entries for a date range (inclusive) */
export async function getEntriesInRange(
  startDate: DateString,
  endDate: DateString
): Promise<DayEntry[]> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const range = IDBKeyRange.bound(startDate, endDate);
      return await db.getAllFromIndex('entries', 'by-date', range);
    } catch {
      // fall through
    }
  }
  // localStorage fallback: scan known keys
  const entries: DayEntry[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const entry = lsGet<DayEntry | null>(`entry_${key}`, null);
    if (entry) entries.push(entry);
  }
  return entries;
}

/** Get ALL entries (for export) */
export async function getAllEntries(): Promise<DayEntry[]> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      return await db.getAll('entries');
    } catch {
      // fall through
    }
  }
  // localStorage fallback
  const entries: DayEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(LS_PREFIX + 'entry_')) {
      const entry = lsGet<DayEntry | null>(key.replace(LS_PREFIX, ''), null);
      if (entry) entries.push(entry);
    }
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================
// PUBLIC API — Streak
// ============================================================

const STREAK_KEY = 'streak';

const DEFAULT_STREAK: StreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastCheckInDate: null,
};

export async function getStreak(): Promise<StreakState> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const s = await db.get('meta', STREAK_KEY);
      return (s as StreakState) ?? { ...DEFAULT_STREAK };
    } catch {
      // fall through
    }
  }
  return lsGet<StreakState>(STREAK_KEY, { ...DEFAULT_STREAK });
}

export async function saveStreak(streak: StreakState): Promise<void> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      await db.put('meta', streak, STREAK_KEY);
      return;
    } catch {
      // fall through
    }
  }
  lsSet(STREAK_KEY, streak);
}

// ============================================================
// PUBLIC API — Settings
// ============================================================

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: AppSettings = {
  morningRoutineEnabled: false,
  graceDayEnabled: true,
  remoteContentUrl: '',
};

export async function getSettings(): Promise<AppSettings> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const s = await db.get('meta', SETTINGS_KEY);
      return (s as AppSettings) ?? { ...DEFAULT_SETTINGS };
    } catch {
      // fall through
    }
  }
  return lsGet<AppSettings>(SETTINGS_KEY, { ...DEFAULT_SETTINGS });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      await db.put('meta', settings, SETTINGS_KEY);
      return;
    } catch {
      // fall through
    }
  }
  lsSet(SETTINGS_KEY, settings);
}

// ============================================================
// PUBLIC API — Content (Quotes & Messages cache)
// ============================================================

const CONTENT_KEY = 'content';
const CONTENT_STATE_KEY = 'contentState';

const DEFAULT_CONTENT_STATE: ContentState = {
  localVersion: 1,
  cachedRemoteVersion: null,
  lastFetchedAt: null,
  source: 'local',
};

export async function getCachedContent(): Promise<ContentData | null> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const c = await db.get('meta', CONTENT_KEY);
      return (c as ContentData) ?? null;
    } catch {
      // fall through
    }
  }
  return lsGet<ContentData | null>(CONTENT_KEY, null);
}

export async function saveCachedContent(content: ContentData): Promise<void> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      await db.put('meta', content, CONTENT_KEY);
      return;
    } catch {
      // fall through
    }
  }
  lsSet(CONTENT_KEY, content);
}

export async function getContentState(): Promise<ContentState> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      const s = await db.get('meta', CONTENT_STATE_KEY);
      return (s as ContentState) ?? { ...DEFAULT_CONTENT_STATE };
    } catch {
      // fall through
    }
  }
  return lsGet<ContentState>(CONTENT_STATE_KEY, { ...DEFAULT_CONTENT_STATE });
}

export async function saveContentState(state: ContentState): Promise<void> {
  if (useIndexedDB) {
    try {
      const db = await getDB();
      await db.put('meta', state, CONTENT_STATE_KEY);
      return;
    } catch {
      // fall through
    }
  }
  lsSet(CONTENT_STATE_KEY, state);
}
