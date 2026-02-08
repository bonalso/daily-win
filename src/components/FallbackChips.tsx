'use client';

import { useState } from 'react';

const DEFAULT_CHIPS = [
  'Gesundheit',
  'Familie',
  'Freunde',
  'Essen',
  'Sicherheit',
  'Sonne',
  'Bewegung',
  'Ruhe',
  'Lernen',
  'Zuhause',
];

interface Props {
  selectedChips: string[];
  onToggle: (chip: string) => void;
  compact?: boolean;
}

export default function FallbackChips({ selectedChips, onToggle, compact = false }: Props) {
  return (
    <div>
      {!compact && (
        <p className="text-sm text-stone-500 mb-2">
          Wofür bist du heute dankbar? (1 Tap genügt)
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {DEFAULT_CHIPS.map((chip) => {
          const isSelected = selectedChips.includes(chip);
          return (
            <button
              key={chip}
              onClick={() => onToggle(chip)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-honey-200 text-honey-700 shadow-sm scale-105'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
              }`}
            >
              {isSelected ? '✓ ' : ''}{chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
