'use client';

import { useState, useEffect } from 'react';
import { Star, Sparkles, Trophy } from 'lucide-react';
import { DayEntry, FavoriteItem } from '@/lib/types';
import { getAllEntries } from '@/lib/db';
import { friendlyDateLabel, formatDate } from '@/lib/utils';

interface EnrichedFavorite extends FavoriteItem {
  date: string;
}

export default function BestOfPage() {
  const [favorites, setFavorites] = useState<EnrichedFavorite[]>([]);
  const [recentHighlights, setRecentHighlights] = useState<{ text: string; date: string }[]>([]);
  const [recentWins, setRecentWins] = useState<{ text: string; date: string }[]>([]);
  const [tab, setTab] = useState<'favorites' | 'highlights' | 'wins'>('favorites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const entries = await getAllEntries();

      // Collect all favorites
      const allFavs: EnrichedFavorite[] = [];
      entries.forEach((entry) => {
        entry.favorites.forEach((fav) => {
          allFavs.push({ ...fav, date: entry.date });
        });
      });
      allFavs.sort((a, b) => b.createdAt - a.createdAt);
      setFavorites(allFavs);

      // Recent 30 days: highlights and wins
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoff = formatDate(thirtyDaysAgo);

      const highlights: { text: string; date: string }[] = [];
      const wins: { text: string; date: string }[] = [];

      entries
        .filter((e) => e.date >= cutoff)
        .forEach((entry) => {
          if (entry.evening) {
            entry.evening.highlights
              .filter(Boolean)
              .forEach((h) => highlights.push({ text: h, date: entry.date }));
            entry.evening.wins
              .filter(Boolean)
              .forEach((w) => wins.push({ text: w, date: entry.date }));
          }
        });

      setRecentHighlights(highlights.reverse());
      setRecentWins(wins.reverse());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-stone-800 text-center mb-2">Best of</h1>
      <p className="text-xs text-stone-400 text-center mb-6">
        Deine besten Momente und Fortschritte
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-stone-100 rounded-xl p-1">
        {(['favorites', 'highlights', 'wins'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tap-bounce flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t === 'favorites' ? (
              <span className="inline-flex items-center gap-1">
                <Star size={14} /> Favoriten
              </span>
            ) : t === 'highlights' ? (
              <span className="inline-flex items-center gap-1">
                <Sparkles size={14} /> Highlights
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Trophy size={14} /> Wins
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'favorites' && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <EmptyState
              icon={<Star size={40} />}
              title="Noch keine Favoriten"
              text="Markiere Highlights oder Wins im Kalender als Favoriten."
            />
          ) : (
            favorites.map((fav, i) => (
              <ItemCard
                key={i}
                text={fav.text}
                type={fav.type}
                date={fav.date}
              />
            ))
          )}
        </div>
      )}

      {tab === 'highlights' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-400 mb-2">Letzte 30 Tage</p>
          {recentHighlights.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={40} />}
              title="Noch keine Highlights"
              text="Deine Highlights erscheinen hier nach dem Abend-Check-out."
            />
          ) : (
            recentHighlights.map((h, i) => (
              <ItemCard key={i} text={h.text} type="highlight" date={h.date} />
            ))
          )}
        </div>
      )}

      {tab === 'wins' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-400 mb-2">Letzte 30 Tage</p>
          {recentWins.length === 0 ? (
            <EmptyState
              icon={<Trophy size={40} />}
              title="Noch keine Wins"
              text="Deine Daily Wins erscheinen hier nach dem Abend-Check-out."
            />
          ) : (
            recentWins.map((w, i) => (
              <ItemCard key={i} text={w.text} type="win" date={w.date} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ItemCard({ text, type, date }: { text: string; type: 'highlight' | 'win'; date: string }) {
  return (
    <div className="card-press bg-white rounded-2xl shadow-soft px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {type === 'highlight' ? <Sparkles size={20} className="text-stone-400" /> : <Trophy size={20} className="text-stone-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-700">{text}</p>
          <p className="text-xs text-stone-400 mt-1">{friendlyDateLabel(date)}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-3 text-stone-300">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-stone-600 mb-1">{title}</h3>
      <p className="text-xs text-stone-400">{text}</p>
    </div>
  );
}
