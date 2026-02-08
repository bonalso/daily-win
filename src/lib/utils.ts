// ============================================================
// Daily Win — Utilities
// ============================================================

import { DateString } from './types';

/** Get today's date as YYYY-MM-DD in local time */
export function todayString(): DateString {
  return formatDate(new Date());
}

/** Format a Date to YYYY-MM-DD in local time */
export function formatDate(d: Date): DateString {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD to Date (local time, midnight) */
export function parseDate(s: DateString): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Get yesterday's date string */
export function yesterdayString(): DateString {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/** Get day-before-yesterday's date string */
export function dayBeforeYesterdayString(): DateString {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return formatDate(d);
}

/** Deterministic daily index based on date string (stable hash) */
export function dailyIndex(date: DateString, arrayLength: number): number {
  if (arrayLength <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % arrayLength;
}

/** Check if current time is "morning" (before 12:00) */
export function isMorning(): boolean {
  return new Date().getHours() < 12;
}

/** Check if current time is "evening" (after 17:00) */
export function isEvening(): boolean {
  return new Date().getHours() >= 17;
}

/** Get dates for the last N days (including today) as YYYY-MM-DD */
export function lastNDays(n: number): DateString[] {
  const dates: DateString[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

/** Get all dates in a given month (year, month 0-indexed) */
export function datesInMonth(year: number, month: number): DateString[] {
  const dates: DateString[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(formatDate(new Date(year, month, d)));
  }
  return dates;
}

/** Friendly relative date label */
export function friendlyDateLabel(date: DateString): string {
  const today = todayString();
  const yesterday = yesterdayString();
  if (date === today) return 'Heute';
  if (date === yesterday) return 'Gestern';
  const d = parseDate(date);
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}`;
}
