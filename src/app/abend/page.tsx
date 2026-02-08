'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EveningEntry, DayEntry } from '@/lib/types';
import { todayString } from '@/lib/utils';
import { getOrCreateEntry, getSettings } from '@/lib/db';
import { recordInteraction } from '@/lib/streak';
import MultiInput from '@/components/MultiInput';
import FallbackChips from '@/components/FallbackChips';

export default function EveningPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [wins, setWins] = useState<string[]>(['']);
  const [learned, setLearned] = useState('');
  const [gratitude, setGratitude] = useState<string[]>(['']);
  const [letGo, setLetGo] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = todayString();
      const existing = await getOrCreateEntry(today);
      setEntry(existing);

      // Pre-fill if evening already exists
      if (existing.evening) {
        const e = existing.evening;
        setHighlights(e.highlights.length > 0 ? e.highlights : ['']);
        setWins(e.wins.length > 0 ? e.wins : ['']);
        setLearned(e.learned);
        setGratitude(e.gratitude.length > 0 ? e.gratitude : ['']);
        setLetGo(e.letGo || '');
      }

      setChips(existing.fallbackChipsSelected);
      setLoading(false);
    })();
  }, []);

  const handleChipToggle = (chip: string) => {
    setChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleSave = async () => {
    if (!entry || saving) return;
    setSaving(true);

    try {
      const evening: EveningEntry = {
        highlights: highlights.filter(Boolean).length > 0 ? highlights : [],
        wins: wins.filter(Boolean).length > 0 ? wins : [],
        learned,
        gratitude: gratitude.filter(Boolean).length > 0 ? gratitude : [],
        letGo: letGo || undefined,
      };

      const hasAnyContent =
        highlights.some(Boolean) ||
        wins.some(Boolean) ||
        learned ||
        gratitude.some(Boolean) ||
        letGo ||
        chips.length > 0;

      const updated: DayEntry = {
        ...entry,
        evening,
        fallbackChipsSelected: chips,
        minimalCheckIn: !hasAnyContent,
        didInteract: true,
      };

      const settings = await getSettings();
      await recordInteraction(updated, settings.graceDayEnabled);

      setSaved(true);
      setTimeout(() => router.push('/'), 1500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl animate-pulse">🌙</div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="text-5xl">🌙</div>
          <h2 className="text-xl font-semibold text-stone-800">Gespeichert!</h2>
          <p className="text-sm text-stone-500">
            Du warst heute für dich da 💛
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-all"
        >
          ← Zurück
        </button>
        <h1 className="text-lg font-bold text-stone-800">Abend-Check-out</h1>
        <div className="w-16"></div>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        Nimm dir 3-5 Minuten. Alles ist optional — einfach absenden zählt schon.
      </p>

      <div className="space-y-6">
        {/* Highlights */}
        <FormSection title="Highlights des Tages" emoji="✨">
          <MultiInput
            values={highlights}
            onChange={setHighlights}
            placeholder="Was war heute gut?"
            maxItems={3}
          />
        </FormSection>

        {/* Wins */}
        <FormSection title="Daily Win / Fortschritt" emoji="🏆">
          <MultiInput
            values={wins}
            onChange={setWins}
            placeholder="Worauf bist du stolz?"
            maxItems={2}
          />
        </FormSection>

        {/* Learned */}
        <FormSection title="Was habe ich gelernt?" emoji="💡">
          <input
            type="text"
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="Eine Erkenntnis, egal wie klein"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
          />
        </FormSection>

        {/* Gratitude */}
        <FormSection title="Wofür bin ich heute dankbar?" emoji="🙏">
          <MultiInput
            values={gratitude}
            onChange={setGratitude}
            placeholder="Wofür bist du dankbar?"
            maxItems={3}
          />
          <div className="mt-3">
            <FallbackChips
              selectedChips={chips}
              onToggle={handleChipToggle}
              compact
            />
          </div>
        </FormSection>

        {/* Let Go */}
        <FormSection title="Was lasse ich heute los?" emoji="🍃" optional>
          <input
            type="text"
            value={letGo}
            onChange={(e) => setLetGo(e.target.value)}
            placeholder="Ein Satz genügt"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
          />
        </FormSection>
      </div>

      {/* Submit */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-stone-800 to-stone-700 text-white font-semibold shadow-soft hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
        >
          {saving ? 'Speichern...' : 'Check-out abschließen 🌙'}
        </button>
        <p className="text-xs text-stone-400 text-center">
          Auch ein leeres Formular zählt — du warst da.
        </p>
      </div>
    </div>
  );
}

function FormSection({
  title,
  emoji,
  optional,
  children,
}: {
  title: string;
  emoji: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
        {optional && (
          <span className="text-xs text-stone-400 ml-auto">Optional</span>
        )}
      </div>
      {children}
    </div>
  );
}
