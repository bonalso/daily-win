'use client';

import { useState, useEffect, useCallback } from 'react';
import { DayEntry, FavoriteItem, isCheckedIn } from '@/lib/types';
import { datesInMonth, formatDate, todayString, parseDate } from '@/lib/utils';
import { getEntriesInRange, getEntry, saveEntry } from '@/lib/db';
import DayDetail from '@/components/DayDetail';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
const WEEKDAY_HEADERS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<Map<string, DayEntry>>(new Map());
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    const dates = datesInMonth(year, month);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const monthEntries = await getEntriesInRange(startDate, endDate);
    const map = new Map<string, DayEntry>();
    monthEntries.forEach((e) => map.set(e.date, e));
    setEntries(map);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = async (date: string) => {
    const entry = entries.get(date);
    if (entry) {
      setSelectedEntry(entry);
    } else {
      // Even if no entry, show empty state
      const fresh = await getEntry(date);
      if (fresh) {
        setSelectedEntry(fresh);
      }
    }
  };

  const handleToggleFavorite = async (type: 'highlight' | 'win', text: string) => {
    if (!selectedEntry) return;
    const existing = selectedEntry.favorites.findIndex(
      (f) => f.type === type && f.text === text
    );
    let updatedFavorites: FavoriteItem[];
    if (existing >= 0) {
      updatedFavorites = selectedEntry.favorites.filter((_, i) => i !== existing);
    } else {
      updatedFavorites = [
        ...selectedEntry.favorites,
        { type, text, createdAt: Date.now() },
      ];
    }
    const updated = { ...selectedEntry, favorites: updatedFavorites, updatedAt: Date.now() };
    await saveEntry(updated);
    setSelectedEntry(updated);
    setEntries((prev) => {
      const next = new Map(prev);
      next.set(updated.date, updated);
      return next;
    });
  };

  // Calendar grid
  const dates = datesInMonth(year, month);
  const firstDay = parseDate(dates[0]).getDay();
  // Adjust for Monday start (0=Mon, 6=Sun)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const today = todayString();

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-stone-800 text-center mb-6">Kalender</h1>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 transition-all"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-stone-700">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 transition-all"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs text-stone-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11" />
        ))}

        {/* Day cells */}
        {dates.map((date) => {
          const entry = entries.get(date);
          const checked = isCheckedIn(entry);
          const isToday = date === today;
          const dayNum = parseInt(date.split('-')[2], 10);
          const hasFavorites = entry && entry.favorites.length > 0;

          return (
            <button
              key={date}
              onClick={() => handleDayClick(date)}
              className={`h-11 rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all relative ${
                checked
                  ? 'bg-honey-100 text-honey-700 hover:bg-honey-200'
                  : isToday
                  ? 'bg-stone-100 text-stone-700 ring-2 ring-honey-300'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <span>{dayNum}</span>
              {checked && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-honey-500" />
              )}
              {hasFavorites && (
                <span className="absolute top-0.5 right-1 text-[8px]">⭐</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-honey-200" />
          <span className="text-xs text-stone-500">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">⭐</span>
          <span className="text-xs text-stone-500">Favoriten</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-3">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-lg font-bold text-honey-600">
              {Array.from(entries.values()).filter(isCheckedIn).length}
            </div>
            <div className="text-xs text-stone-500">Tage aktiv</div>
          </div>
          <div>
            <div className="text-lg font-bold text-honey-600">
              {Array.from(entries.values()).reduce(
                (sum, e) => sum + e.favorites.length,
                0
              )}
            </div>
            <div className="text-xs text-stone-500">Favoriten</div>
          </div>
          <div>
            <div className="text-lg font-bold text-honey-600">
              {dates.length}
            </div>
            <div className="text-xs text-stone-500">Tage im Monat</div>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedEntry && (
        <DayDetail
          entry={selectedEntry}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
