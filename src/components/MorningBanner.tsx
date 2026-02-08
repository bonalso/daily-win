'use client';

import { isMorning } from '@/lib/utils';
import { DEFAULT_MORNING_MESSAGES } from '@/lib/morning-messages';

interface Props {
  message?: string;
}

export default function MorningBanner({ message }: Props) {
  const morning = isMorning();

  // Fallback 1: erste Nachricht aus der Liste
  let safeMessage = DEFAULT_MORNING_MESSAGES[0];

  // Fallback 2: absoluter Notfall
  if (!safeMessage || safeMessage.trim().length === 0) {
    safeMessage = 'Schön, dass du da bist. Heute reicht auch ein kleiner Schritt 💛';
  }

  // Wenn eine gültige Message übergeben wurde, nutze diese
  if (typeof message === 'string' && message.trim().length > 0) {
    safeMessage = message;
  }

  return (
    <div
      className={`rounded-2xl px-5 py-4 transition-all duration-500 ${
        morning
          ? 'bg-gradient-to-br from-honey-100 via-warm-100 to-honey-50 shadow-soft'
          : 'bg-stone-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${morning ? 'animate-pulse' : ''}`}>
          {morning ? '☀️' : '🌙'}
        </span>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm leading-relaxed ${
              morning ? 'text-stone-700 font-medium' : 'text-stone-500'
            }`}
          >
            {safeMessage}
          </p>

          {!morning && (
            <p className="text-xs text-stone-400 mt-1">Deine Morgenbotschaft</p>
          )}
        </div>
      </div>
    </div>
  );
}
