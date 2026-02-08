// ============================================================
// Daily Win — Data Model
// ============================================================

/** Format: YYYY-MM-DD */
export type DateString = string;

// ── Morning sub-entry ──────────────────────────────────────
export interface MorningEntry {
  enabledAtTheTime: boolean;
  gratitude: string[];
  progress: string;
  tasks: string[];
  affirmation: string;
}

// ── Evening sub-entry ──────────────────────────────────────
export interface EveningEntry {
  highlights: string[];
  wins: string[];
  learned: string;
  gratitude: string[];
  letGo?: string;
}

// ── Favorite item ──────────────────────────────────────────
export interface FavoriteItem {
  type: 'highlight' | 'win';
  text: string;
  createdAt: number; // epoch ms
}

// ── Full day entry ─────────────────────────────────────────
export interface DayEntry {
  date: DateString;           // YYYY-MM-DD
  createdAt: number;          // epoch ms
  updatedAt: number;          // epoch ms
  didInteract: boolean;
  minimalCheckIn: boolean;
  quickCheckInPressed: boolean;
  fallbackChipsSelected: string[];
  morning: MorningEntry | null;
  evening: EveningEntry | null;
  favorites: FavoriteItem[];
}

// ── Streak state ───────────────────────────────────────────
export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastCheckInDate: DateString | null;
}

// ── Content state (quotes / messages) ──────────────────────
export interface ContentState {
  localVersion: number;
  cachedRemoteVersion: number | null;
  lastFetchedAt: number | null;
  source: 'local' | 'cachedRemote';
}

// ── Content data ───────────────────────────────────────────
export interface ContentData {
  quotes: string[];
  morningMessages: string[];
}

// ── App settings ───────────────────────────────────────────
export interface AppSettings {
  morningRoutineEnabled: boolean;
  graceDayEnabled: boolean;
  remoteContentUrl: string;
}

// ── Helper: create blank day entry ─────────────────────────
export function createBlankDayEntry(date: DateString): DayEntry {
  const now = Date.now();
  return {
    date,
    createdAt: now,
    updatedAt: now,
    didInteract: false,
    minimalCheckIn: false,
    quickCheckInPressed: false,
    fallbackChipsSelected: [],
    morning: null,
    evening: null,
    favorites: [],
  };
}

// ── Helper: check if entry counts as checked-in ────────────
export function isCheckedIn(entry: DayEntry | null | undefined): boolean {
  if (!entry) return false;
  return (
    entry.didInteract ||
    entry.quickCheckInPressed ||
    entry.fallbackChipsSelected.length > 0 ||
    entry.morning !== null ||
    entry.evening !== null
  );
}
