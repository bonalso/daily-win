'use client';

import { X, CircleCheck, Star } from 'lucide-react';
import { DayEntry, FavoriteItem } from '@/lib/types';
import { friendlyDateLabel } from '@/lib/utils';

interface Props {
  entry: DayEntry;
  onToggleFavorite: (type: 'highlight' | 'win', text: string) => void;
  onClose: () => void;
}

export default function DayDetail({ entry, onToggleFavorite, onClose }: Props) {
  const isFavorited = (type: 'highlight' | 'win', text: string) => {
    return entry.favorites.some((f) => f.type === type && f.text === text);
  };

  const hasContent =
    entry.quickCheckInPressed ||
    entry.fallbackChipsSelected.length > 0 ||
    entry.evening !== null ||
    entry.morning !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto shadow-xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm px-5 py-4 flex items-center justify-between border-b border-stone-100 rounded-t-3xl">
          <h2 className="text-lg font-semibold text-stone-800">
            {friendlyDateLabel(entry.date)}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {entry.quickCheckInPressed && (
            <div className="flex items-center gap-2 text-sage-600 bg-sage-50 px-4 py-2 rounded-xl">
              <CircleCheck size={18} className="text-sage-600" />
              <span className="text-sm font-medium">Kurzer Check-in</span>
            </div>
          )}

          {entry.fallbackChipsSelected.length > 0 && (
            <Section title="Dankbar für">
              <div className="flex flex-wrap gap-2">
                {entry.fallbackChipsSelected.map((chip) => (
                  <span key={chip} className="px-3 py-1 rounded-full bg-honey-100 text-honey-700 text-sm">
                    {chip}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {entry.evening && (
            <>
              {entry.evening.highlights.filter(Boolean).length > 0 && (
                <Section title="Highlights">
                  {entry.evening.highlights.filter(Boolean).map((h, i) => (
                    <FavoritableItem
                      key={i}
                      text={h}
                      type="highlight"
                      favorited={isFavorited('highlight', h)}
                      onToggle={() => onToggleFavorite('highlight', h)}
                    />
                  ))}
                </Section>
              )}
              {entry.evening.wins.filter(Boolean).length > 0 && (
                <Section title="Daily Wins">
                  {entry.evening.wins.filter(Boolean).map((w, i) => (
                    <FavoritableItem
                      key={i}
                      text={w}
                      type="win"
                      favorited={isFavorited('win', w)}
                      onToggle={() => onToggleFavorite('win', w)}
                    />
                  ))}
                </Section>
              )}
              {entry.evening.learned && (
                <Section title="Gelernt">
                  <p className="text-sm text-stone-600">{entry.evening.learned}</p>
                </Section>
              )}
              {entry.evening.gratitude.filter(Boolean).length > 0 && (
                <Section title="Dankbarkeit">
                  <ul className="space-y-1">
                    {entry.evening.gratitude.filter(Boolean).map((g, i) => (
                      <li key={i} className="text-sm text-stone-600">• {g}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {entry.evening.letGo && (
                <Section title="Losgelassen">
                  <p className="text-sm text-stone-600 italic">{entry.evening.letGo}</p>
                </Section>
              )}
            </>
          )}

          {entry.morning && (
            <>
              <div className="pt-2 border-t border-stone-100">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                  Morgenroutine
                </h3>
              </div>
              {entry.morning.gratitude.filter(Boolean).length > 0 && (
                <Section title="Dankbar für">
                  <ul className="space-y-1">
                    {entry.morning.gratitude.filter(Boolean).map((g, i) => (
                      <li key={i} className="text-sm text-stone-600">• {g}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {entry.morning.progress && (
                <Section title="Fortschritt durch">
                  <p className="text-sm text-stone-600">{entry.morning.progress}</p>
                </Section>
              )}
              {entry.morning.tasks.filter(Boolean).length > 0 && (
                <Section title="Aufgaben">
                  <ul className="space-y-1">
                    {entry.morning.tasks.filter(Boolean).map((t, i) => (
                      <li key={i} className="text-sm text-stone-600">• {t}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {entry.morning.affirmation && (
                <Section title="Affirmation">
                  <p className="text-sm text-stone-600 italic">{entry.morning.affirmation}</p>
                </Section>
              )}
            </>
          )}

          {!hasContent && entry.minimalCheckIn && (
            <div className="text-center py-6 text-stone-400">
              <p className="text-sm">Du warst da — das zählt 💛</p>
            </div>
          )}

          {!hasContent && !entry.minimalCheckIn && (
            <div className="text-center py-6 text-stone-400">
              <p className="text-sm">Noch kein Eintrag für diesen Tag.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FavoritableItem({
  text,
  type,
  favorited,
  onToggle,
}: {
  text: string;
  type: 'highlight' | 'win';
  favorited: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-2 group">
      <p className="text-sm text-stone-600 flex-1">{text}</p>
      <button
        onClick={onToggle}
        className={`text-base transition-all p-1 rounded-lg ${
          favorited
            ? 'text-honey-500'
            : 'text-stone-300 opacity-0 group-hover:opacity-100 hover:text-honey-400'
        }`}
        title={favorited ? 'Favorit entfernen' : 'Als Favorit markieren'}
      >
        <Star size={16} className={favorited ? 'fill-current' : ''} />
      </button>
    </div>
  );
}
