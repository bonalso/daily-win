export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-6 space-y-6">
      {/* Title */}
      <div className="h-6 w-40 rounded bg-stone-100 animate-pulse" />

      {/* Setting card 1 */}
      <div className="rounded-2xl p-4 space-y-3">
        <div className="h-4 w-1/2 rounded bg-stone-100 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-stone-100 animate-pulse" />
      </div>

      {/* Setting card 2 */}
      <div className="rounded-2xl p-4 space-y-3">
        <div className="h-4 w-1/3 rounded bg-stone-100 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-stone-100 animate-pulse" />
      </div>
    </main>
  );
}
