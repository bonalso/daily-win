'use client';

import { useState } from 'react';

interface Props {
  alreadyCheckedIn: boolean;
  onCheckIn: () => Promise<void>;
}

export default function QuickCheckIn({ alreadyCheckedIn, onCheckIn }: Props) {
  const [loading, setLoading] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const handleClick = async () => {
    if (alreadyCheckedIn || justCheckedIn || loading) return;
    setLoading(true);
    try {
      await onCheckIn();
      setJustCheckedIn(true);
    } finally {
      setLoading(false);
    }
  };

  const done = alreadyCheckedIn || justCheckedIn;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-300 ${
        done
          ? 'bg-sage-100 text-sage-600 shadow-none'
          : 'bg-gradient-to-r from-honey-400 to-honey-500 text-white shadow-glow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
      }`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="animate-spin text-sm">⏳</span>
          Moment...
        </span>
      ) : done ? (
        'Du warst heute da — schön! ✅'
      ) : (
        'Heute war ich kurz da ✅'
      )}
    </button>
  );
}
