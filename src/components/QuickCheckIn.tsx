'use client';

import { useEffect, useState } from 'react';
import { Loader2, CircleCheck } from 'lucide-react';

interface Props {
  alreadyCheckedIn: boolean;
  onCheckIn: () => Promise<void>;
}

function Toast({ text, show }: { text: string; show: boolean }) {
  return (
    <div
      className={[
        'fixed left-1/2 bottom-[calc(72px+env(safe-area-inset-bottom))] -translate-x-1/2 z-50',
        'px-4 py-2 rounded-2xl shadow-soft',
        'bg-white/90 backdrop-blur text-sm text-stone-700',
        'transition-all duration-200',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
      ].join(' ')}
      aria-live="polite"
    >
      {text}
    </div>
  );
}

export default function QuickCheckIn({ alreadyCheckedIn, onCheckIn }: Props) {
  const [loading, setLoading] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; text: string }>({
    show: false,
    text: 'Gespeichert 💛',
  });

  const done = alreadyCheckedIn || justCheckedIn;

  const handleClick = async () => {
    if (done || loading) return;
    setLoading(true);

    try {
      await onCheckIn();
      setJustCheckedIn(true);

      // Show toast
      setToast({ show: true, text: 'Gespeichert 💛' });
      setTimeout(() => setToast({ show: false, text: 'Gespeichert 💛' }), 1600);
    } finally {
      setLoading(false);
    }
  };

  // If page loads and user already checked in, keep it calm (no toast)
  useEffect(() => {
    if (alreadyCheckedIn) {
      setToast((t) => ({ ...t, show: false }));
    }
  }, [alreadyCheckedIn]);

  return (
    <>
      <Toast text={toast.text} show={toast.show} />

      <button
        onClick={handleClick}
        disabled={loading}
        className={[
          'w-full py-4 px-6 rounded-2xl text-base font-semibold',
          'transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-300 focus-visible:ring-offset-2',
          done
            ? 'bg-sage-100 text-sage-600 shadow-none'
            : 'bg-gradient-to-r from-honey-400 to-honey-500 text-white shadow-glow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
          loading ? 'opacity-95' : '',
        ].join(' ')}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Moment...
          </span>
        ) : done ? (
          <span className="inline-flex items-center gap-2">
            Du warst heute da — schön! <CircleCheck size={18} />
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Heute war ich kurz da <CircleCheck size={18} />
          </span>
        )}
      </button>
    </>
  );
}
