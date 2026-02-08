// ============================================================
// Daily Win — Tolerant Streak Logic
// Core differentiator: forgiving, supportive, never punishing.
// ============================================================

import { StreakState, DayEntry, isCheckedIn } from './types';
import { todayString, yesterdayString, dayBeforeYesterdayString } from './utils';
import { getEntry, saveStreak } from './db';

// ✅ Re-export, damit page.tsx `getStreak` aus '@/lib/streak' importieren kann
export { getStreak } from './db';

/**
 * Recalculate and persist the streak after any interaction.
 *
 * Rules:
 * - A day counts if isCheckedIn(entry) is true.
 * - Streak increments if today is checked in AND yesterday was checked in.
 * - Grace day (optional): if yesterday was missed but day-before-yesterday
 *   was checked in, streak is preserved (supportive).
 * - Streak never uses shaming language.
 */
export async function recalculateStreak(
  graceDayEnabled: boolean = true
): Promise<StreakState> {
  const { getStreak } = await import('./db');

  const streak = await getStreak();
  const today = todayString();
  const yesterday = yesterdayString();
  const dayBeforeYesterday = dayBeforeYesterdayString();

  const todayEntry = await getEntry(today);
  const yesterdayEntry = await getEntry(yesterday);
  const dayBeforeYesterdayEntry = await getEntry(dayBeforeYesterday);

  const todayChecked = isCheckedIn(todayEntry);
  const yesterdayChecked = isCheckedIn(yesterdayEntry);
  const dayBeforeChecked = isCheckedIn(dayBeforeYesterdayEntry);

  if (!todayChecked) {
    // User hasn't checked in today yet — don't change streak
    return streak;
  }

  // Today IS checked in
  if (streak.lastCheckInDate === today) {
    // Already counted today — no change needed
    return streak;
  }

  let newCurrentStreak: number;

  if (streak.lastCheckInDate === yesterday) {
    // Consecutive day — increment
    newCurrentStreak = streak.currentStreak + 1;
  } else if (
    graceDayEnabled &&
    streak.lastCheckInDate === dayBeforeYesterday &&
    !yesterdayChecked &&
    dayBeforeChecked
  ) {
    // Grace day: missed yesterday, but day-before was last check-in.
    // Preserve streak (don't increment, don't break).
    newCurrentStreak = streak.currentStreak + 1;
  } else if (streak.lastCheckInDate === null) {
    // First ever check-in
    newCurrentStreak = 1;
  } else {
    // Gap too large — start fresh, but supportively
    newCurrentStreak = 1;
  }

  const newStreak: StreakState = {
    currentStreak: newCurrentStreak,
    bestStreak: Math.max(streak.bestStreak, newCurrentStreak),
    lastCheckInDate: today
  };

  await saveStreak(newStreak);
  return newStreak;
}

/**
 * Mark today as interacted and recalculate streak.
 * This is the main function called after any check-in action.
 */
export async function recordInteraction(
  entry: DayEntry,
  graceDayEnabled: boolean = true
): Promise<{ entry: DayEntry; streak: StreakState }> {
  entry.didInteract = true;
  entry.updatedAt = Date.now();

  const { saveEntry } = await import('./db');
  await saveEntry(entry);

  const streak = await recalculateStreak(graceDayEnabled);
  return { entry, streak };
}

/**
 * Get a supportive streak message in German.
 */
export function getStreakMessage(streak: StreakState): string {
  const { currentStreak } = streak;
  if (currentStreak === 0) return 'Starte deine Serie — du schaffst das!';
  if (currentStreak === 1) return 'Tag 1 — ein schöner Anfang ✨';
  if (currentStreak <= 3) return `${currentStreak} Tage am Stück — weiter so! 💪`;
  if (currentStreak <= 7) return `${currentStreak} Tage — du baust dir eine tolle Gewohnheit auf 🌱`;
  if (currentStreak <= 14) return `${currentStreak} Tage — beeindruckend! Du bleibst dran 🔥`;
  if (currentStreak <= 30) return `${currentStreak} Tage — was für eine Serie! 🌟`;
  return `${currentStreak} Tage — unglaublich! Du inspirierst 💛`;
}
