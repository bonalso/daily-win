'use client';

export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="h-7 w-40 rounded-xl skeleton" />

        {/* Cards */}
        <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-5 space-y-3">
          <div className="h-4 w-40 rounded skeleton" />
          <div className="h-4 w-5/6 rounded skeleton" />
          <div className="h-4 w-2/3 rounded skeleton" />
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-5 space-y-3">
          <div className="h-4 w-36 rounded skeleton" />
          <div className="h-4 w-4/5 rounded skeleton" />
          <div className="h-4 w-1/2 rounded skeleton" />
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 shadow-soft p-5 space-y-3">
          <div className="h-4 w-44 rounded skeleton" />
          <div className="h-4 w-5/6 rounded skeleton" />
          <div className="h-4 w-2/3 rounded skeleton" />
        </div>
      </div>
    </main>
  );
}
