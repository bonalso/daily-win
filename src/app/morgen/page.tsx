'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MorningEntry, DayEntry } from '@/lib/types';
import { todayString } from '@/lib/utils';
import { getOrCreateEntry, getSettings } from '@/lib/db';
import { recordInteraction } from '@/lib/streak';
import MultiInput from '@/components/MultiInput';
import FallbackChips from '@/components/FallbackChips';

const DEFAULT_AFFIRMATIONS = [
  'Ich bin genug.',
  'Ich schaffe das.',
  'Heute wird ein guter Tag.',
  'Ich bin dankbar für das, was ich habe.',
  'Ich wachse jeden Tag ein Stück.',
  'Ich verdiene gute Dinge.',
  'Ich bin auf dem richtigen Weg.',
  'Ich bin stark und mutig.',
];

export default function MorningPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [gratitude, setGratitude] = useState<string[]>(['']);
  const [chips, setChips] = useState<string[]>([]);
  const [progress, setProgress] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [affirmation, setAffirmation] = useState('');
  const [customAffirmation, setCustomAffirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [morningEnabled, setMorningEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setMorningEnabled(settings.morningRoutineEnabled);

      const today = todayString();
      const existing = await getOrCreateEntry(today);
      setEntry(existing);

      if (existing.morning) {
        const m = existing.morning;
        setGratitude(m.gratitude.length > 0 ? m.gratitude : ['']);
        setProgress(m.progress);
        setTasks(m.tasks.length > 0 ? m.tasks : ['']);
        setAffirmation(m.affirmation);
        if (m.affirmation && !DEFAULT_AFFIRMATIONS.includes(m.affirmation)) {
          setCustomAffirmation(true);
        }
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
      const morning: MorningEntry = {
        enabledAtTheTime: morningEnabled,
        gratitude: gratitude.filter(Boolean).length > 0 ? gratitude : [],
        progress,
        tasks: tasks.filter(Boolean).length > 0 ? tasks : [],
        affirmation,
      };

      const hasAnyContent =
        gratitude.some(Boolean) ||
        progress ||
        tasks.some(Boolean) ||
        affirmation ||
        chips.length > 0;

      const updated: DayEntry = {
        ...entry,
        morning,
        fallbackChipsSelected: chips,
        minimalCheckIn: !hasAnyContent && !entry.evening,
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
        <div className="text-3xl animate-pulse">☀️</div>
      </div>
    );
  }

  if (!morningEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">☀️</div>
          <h2 className="text-lg font-semibold text-stone-800">Morgenroutine</h2>
          <p className="text-sm text-stone-500">
            Die Morgenroutine ist aktuell nicht aktiviert.
          </p>
          <button
            onClick={() => router.push('/einstellungen')}
            className="text-sm text-honey-600 font-medium hover:text-honey-700"
          >
            In den Einstellungen aktivieren →
          </button>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3 animate-fade-in">
          <div className="text-5xl">☀️</div>
          <h2 className="text-xl font-semibold text-stone-800">Gespeichert!</h2>
          <p className="text-sm text-stone-500">
            Starte gut in den Tag 💛
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-all"
        >
          ← Zurück
        </button>
        <h1 className="text-lg font-bold text-stone-800">Morgen-Check-in</h1>
        <div className="w-16"></div>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        Starte bewusst in den Tag. Alles ist optional.
      </p>

      <div className="space-y-6">
        <FormSection title="Ich bin dankbar für..." emoji="🙏">
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

        <FormSection title="Heute mache ich Fortschritt durch..." emoji="🚀">
          <input
            type="text"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="Ein konkreter Schritt"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
          />
        </FormSection>

        <FormSection title="Heute erledige ich..." emoji="📋">
          <MultiInput
            values={tasks}
            onChange={setTasks}
            placeholder="Top-Aufgabe"
            maxItems={3}
          />
        </FormSection>

        <FormSection title="Heutige Affirmation" emoji="💪">
          {!customAffirmation ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_AFFIRMATIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAffirmation(a === affirmation ? '' : a)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      affirmation === a
                        ? 'bg-honey-200 text-honey-700 font-medium'
                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setCustomAffirmation(true);
                  setAffirmation('');
                }}
                className="text-xs text-honey-600 hover:text-honey-700 font-medium"
              >
                Eigene Affirmation schreiben →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={affirmation}
                onChange={(e) => setAffirmation(e.target.value)}
                placeholder="Deine eigene Affirmation"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
              />
              <button
                onClick={() => {
                  setCustomAffirmation(false);
                  setAffirmation('');
                }}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                ← Aus Vorschlägen wählen
              </button>
            </div>
          )}
        </FormSection>
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-honey-400 to-honey-500 text-white font-semibold shadow-glow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
        >
          {saving ? 'Speichern...' : 'Morgen-Check-in abschließen ☀️'}
        </button>
        <p className="text-xs text-stone-400 text-center">
          Auch leer absenden zählt — du warst da.
        </p>
      </div>
    </div>
  );
}

function FormSection({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}
