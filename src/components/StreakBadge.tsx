'use client';

import { StreakState } from '@/lib/types';
import { getStreakMessage } from '@/lib/streak';

interface Props {
  streak: StreakState;
}

export default function StreakBadge({ streak }: Props) {
  const message = getStreakMessage(streak);

  if (streak.currentStreak === 0) {
    return (
      <div className="px-4 py-3 rounded-2xl bg-stone-50 text-center">
        <p className="text-sm text-stone-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-honey-50 to-warm-50 text-center shadow-soft">
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">🔥</span>
        <span className="text-2xl font-bold text-honey-600">
          {streak.currentStreak}
        </span>
        <span className="text-sm text-stone-600">
          {streak.currentStreak === 1 ? 'Tag' : 'Tage'}
        </span>
      </div>
      <p className="text-sm text-stone-500 mt-1">{message}</p>
      {streak.bestStreak > streak.currentStreak && (
        <p className="text-xs text-stone-400 mt-0.5">
          Dein Rekord: {streak.bestStreak} Tage 🏆
        </p>
      )}
    </div>
  );
}
