'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DayEntry, isCheckedIn } from '@/lib/types';
import { todayString, lastNDays } from '@/lib/utils';
import { getOrCreateEntry, saveEntry, getEntry, getSettings } from '@/lib/db';
import { recordInteraction } from '@/lib/streak';
import { getTodayQuote, getTodayMorningMessage } from '@/lib/content-provider';
import { StreakState } from '@/lib/types';
import { getStreak, recalculateStreak } from '@/lib/streak';
import MorningBanner from '@/components/MorningBanner';
import QuoteOfDay from '@/components/QuoteOfDay';
import QuickCheckIn from '@/components/QuickCheckIn';
import FallbackChips from '@/components/FallbackChips';
import StreakBadge from '@/components/StreakBadge';
import WeekDots from '@/components/WeekDots';

export default function HomePage() {
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [streak, setStreak] = useState<StreakState>({ currentStreak: 0, bestStreak: 0, lastCheckInDate: null });
  const [quote, setQuote] = useState('');
  const [morningMsg, setMorningMsg] = useState('');
  const [weekEntries, setWeekEntries] = useState<Map<string, DayEntry>>(new Map());
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const today = todayString();
      const [todayEntry, streakData, settings] = await Promise.all([
        getOrCreateEntry(today),
        getStreak(),
        getSettings(),
      ]);

      setEntry(todayEntry);
      setStreak(streakData);
      setMorningEnabled(settings.morningRoutineEnabled);

      // Load content
      const [q, m] = await Promise.all([
        getTodayQuote(settings.remoteContentUrl || undefined),
        getTodayMorningMessage(settings.remoteContentUrl || undefined),
      ]);
      setQuote(q);
      setMorningMsg(m);

      // Load week entries
      const days = lastNDays(7);
      const map = new Map<string, DayEntry>();
      for (const date of days) {
        const e = await getEntry(date);
        if (e) map.set(date, e);
      }
      setWeekEntries(map);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickCheckIn = async () => {
    if (!entry) return;
    const updated = { ...entry, quickCheckInPressed: true };
    const settings = await getSettings();
    const result = await recordInteraction(updated, settings.graceDayEnabled);
    setEntry(result.entry);
    setStreak(result.streak);
    // Update week entries
    setWeekEntries((prev) => {
      const next = new Map(prev);
      next.set(result.entry.date, result.entry);
      return next;
    });
  };

  const handleChipToggle = async (chip: string) => {
    if (!entry) return;
    const chips = entry.fallbackChipsSelected.includes(chip)
      ? entry.fallbackChipsSelected.filter((c) => c !== chip)
      : [...entry.fallbackChipsSelected, chip];
    const updated = { ...entry, fallbackChipsSelected: chips };
    const settings = await getSettings();
    const result = await recordInteraction(updated, settings.graceDayEnabled);
    setEntry(result.entry);
    setStreak(result.streak);
    setWeekEntries((prev) => {
      const next = new Map(prev);
      next.set(result.entry.date, result.entry);
      return next;
    });
  };

  const alreadyCheckedIn = entry ? isCheckedIn(entry) : false;

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-4">
      {/* App Title */}
      <div className="text-center mb-2">
        <h1 className="text-xl font-bold text-stone-800">
          Daily Win
        </h1>
        <p className="text-xs text-stone-400">Dein Dankbarkeits- & Fortschrittsjournal</p>
      </div>

      {/* Morning Banner */}
      <MorningBanner message={morningMsg} />

      {/* Quote of the Day */}
      <QuoteOfDay quote={quote} />

      {/* Streak Badge */}
      <StreakBadge streak={streak} />

      {/* Week Overview */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-3">
        <WeekDots entries={weekEntries} />
      </div>

      {/* Main Action: Evening Check-out */}
      <Link
        href="/abend"
        className="block w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-stone-800 to-stone-700 text-white text-center font-semibold shadow-soft hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
      >
        Abend-Check-out starten 🌙
      </Link>

      {/* Optional Morning Check-in */}
      {morningEnabled && (
        <Link
          href="/morgen"
          className="block w-full py-3 px-6 rounded-2xl bg-warm-50 border border-warm-200 text-warm-600 text-center font-medium hover:bg-warm-100 transition-all duration-200"
        >
          Morgen-Check-in ☀️
        </Link>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-stone-100"></div>
        <span className="text-xs text-stone-400">Schnell-Check-in</span>
        <div className="flex-1 h-px bg-stone-100"></div>
      </div>

      {/* Quick Check-in Button */}
      <QuickCheckIn
        alreadyCheckedIn={alreadyCheckedIn}
        onCheckIn={handleQuickCheckIn}
      />

      {/* Fallback Chips */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-4">
        <FallbackChips
          selectedChips={entry?.fallbackChipsSelected ?? []}
          onToggle={handleChipToggle}
        />
      </div>

      {/* Supportive Footer */}
      {alreadyCheckedIn && (
        <div className="text-center py-3">
          <p className="text-sm text-sage-600 font-medium">
            Du warst heute für dich da 💛
          </p>
        </div>
      )}
    </div>
  );
}
