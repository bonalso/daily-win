'use client';

import { Sparkle } from 'lucide-react';

interface Props {
  quote?: string; // optional, damit es nie crasht
}

export default function QuoteOfDay({ quote }: Props) {
  const fallbackQuote =
    'Atme kurz durch. Du musst heute nicht perfekt sein.';

  const safeQuote =
    typeof quote === 'string' && quote.trim().length > 0
      ? quote
      : fallbackQuote;

  return (
    <div className="px-5 py-4 rounded-2xl bg-white shadow-soft">
      <div className="flex items-start gap-3">
        <Sparkle size={16} className="text-honey-400 flex-shrink-0 mt-0.5" />

        <p className="text-sm text-stone-600 italic leading-relaxed flex-1">
          „{safeQuote}"
        </p>
      </div>
    </div>
  );
}
