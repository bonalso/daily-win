'use client';

export default function Toast({ text, show }: { text: string; show: boolean }) {
  return (
    <div
      className={[
        'fixed left-1/2 bottom-[calc(72px+env(safe-area-inset-bottom))] -translate-x-1/2',
        'px-4 py-2 rounded-2xl shadow-soft',
        'bg-white/90 backdrop-blur text-sm text-stone-700',
        'transition-all duration-200',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      ].join(' ')}
    >
      {text}
    </div>
  );
}
