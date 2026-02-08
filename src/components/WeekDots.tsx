'use client';

import { Check } from 'lucide-react';
import { DayEntry, isCheckedIn } from '@/lib/types';
import { lastNDays } from '@/lib/utils';

interface Props {
  entries: Map<string, DayEntry>;
}

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function WeekDots({ entries }: Props) {
  const days = lastNDays(7);

  return (
    <div>
      <p className="text-xs text-stone-400 mb-2 font-medium">Letzte 7 Tage</p>
      <div className="flex items-center justify-between gap-1">
        {days.map((date, i) => {
          const entry = entries.get(date);
          const checked = isCheckedIn(entry);
          const dayOfWeek = new Date(date).getDay();
          // German week starts Monday, so adjust: 0=Sun -> 6, 1=Mon -> 0, ...
          const label = WEEKDAY_LABELS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
          const isToday = i === days.length - 1;

          return (
            <div key={date} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-stone-400">{label}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  checked
                    ? 'bg-honey-400 text-white shadow-sm'
                    : isToday
                    ? 'bg-stone-100 text-stone-500 ring-2 ring-honey-300'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {checked ? <Check size={14} strokeWidth={2.5} /> : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
