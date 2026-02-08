export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <div className="space-y-4">
        {/* Header / Top area */}
        <div className="h-8 w-44 rounded-xl bg-stone-100 animate-pulse" />

        {/* Morning banner skeleton */}
        <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-honey-100 via-warm-100 to-honey-50 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-white/60 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-5/6 rounded bg-white/60 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-white/50 animate-pulse" />
              <div className="h-3 w-32 rounded bg-white/40 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quote of the day skeleton */}
        <div className="px-5 py-4 rounded-2xl bg-white shadow-soft">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-stone-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-5/6 rounded bg-stone-100 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-stone-100 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Streak / stats card skeleton */}
        <div className="rounded-2xl bg-white shadow-soft p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-stone-100 animate-pulse" />
              <div className="h-6 w-44 rounded bg-stone-100 animate-pulse" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-stone-100 animate-pulse" />
          </div>
        </div>

        {/* Quick check-in skeleton */}
        <div className="rounded-2xl bg-white shadow-soft p-5 space-y-3">
          <div className="h-4 w-40 rounded bg-stone-100 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 rounded-2xl bg-stone-100 animate-pulse" />
            <div className="h-11 rounded-2xl bg-stone-100 animate-pulse" />
            <div className="h-11 rounded-2xl bg-stone-100 animate-pulse" />
            <div className="h-11 rounded-2xl bg-stone-100 animate-pulse" />
          </div>
          <div className="h-10 w-full rounded-2xl bg-stone-100 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
