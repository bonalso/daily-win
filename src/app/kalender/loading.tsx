'use client';

export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <div className="space-y-4">
        {/* Header: Month + small controls */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 rounded-xl bg-stone-100 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-stone-100 animate-pulse" />
            <div className="h-9 w-9 rounded-xl bg-stone-100 animate-pulse" />
          </div>
        </div>

        {/* Weekday row */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-stone-100 animate-pulse"
            />
          ))}
        </div>

        {/* Calendar grid */}
        <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-stone-100 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Below-calendar: summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-4 space-y-2">
            <div className="h-4 w-24 rounded bg-stone-100 animate-pulse" />
            <div className="h-6 w-16 rounded bg-stone-100 animate-pulse" />
          </div>
          <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-4 space-y-2">
            <div className="h-4 w-28 rounded bg-stone-100 animate-pulse" />
            <div className="h-6 w-20 rounded bg-stone-100 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
