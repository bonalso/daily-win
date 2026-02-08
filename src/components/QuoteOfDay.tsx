'use client';

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
    <div className="px-5 py-4 rounded-2xl bg-white border border-stone-100 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5 text-honey-400">✦</span>

        <p className="text-sm text-stone-600 italic leading-relaxed flex-1">
          „{safeQuote}“
        </p>
      </div>
    </div>
  );
}
