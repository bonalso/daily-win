'use client';

import { useState, useEffect } from 'react';
import { AppSettings } from '@/lib/types';
import { getSettings, saveSettings, getContentState } from '@/lib/db';
import { exportJSON, exportMarkdown } from '@/lib/export';
import { ContentState } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [contentState, setContentState] = useState<ContentState | null>(null);
  const [saving, setSaving] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setSettings(s);
      const cs = await getContentState();
      setContentState(cs);
    })();
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSaving(true);
    await saveSettings(updated);
    setSaving(false);
  };

  const handleExportJSON = async () => {
    setExportMsg('JSON wird exportiert...');
    await exportJSON();
    setExportMsg('JSON exportiert!');
    setTimeout(() => setExportMsg(''), 2000);
  };

  const handleExportMarkdown = async () => {
    setExportMsg('Markdown wird exportiert...');
    await exportMarkdown();
    setExportMsg('Markdown exportiert!');
    setTimeout(() => setExportMsg(''), 2000);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl animate-pulse">⚙️</div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-stone-800 text-center mb-6">Einstellungen</h1>

      <div className="space-y-4">
        {/* Morning Routine Toggle */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-stone-700">Morgenroutine</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Aktiviere den optionalen Morgen-Check-in
              </p>
            </div>
            <Toggle
              enabled={settings.morningRoutineEnabled}
              onChange={(v) => updateSetting('morningRoutineEnabled', v)}
            />
          </div>
        </SettingCard>

        {/* Grace Day Toggle */}
        <SettingCard>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-semibold text-stone-700">Kulanz-Tag</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Erlaube einen Tag Pause, ohne die Serie zu verlieren. Weil das Leben manchmal dazwischenkommt.
              </p>
            </div>
            <Toggle
              enabled={settings.graceDayEnabled}
              onChange={(v) => updateSetting('graceDayEnabled', v)}
            />
          </div>
        </SettingCard>

        {/* Streak Explanation */}
        <SettingCard>
          <h3 className="text-sm font-semibold text-stone-700 mb-2">So funktioniert deine Serie</h3>
          <div className="space-y-2 text-xs text-stone-500">
            <p>Deine Serie zählt jeden Tag, an dem du irgendwie aktiv warst:</p>
            <ul className="space-y-1 pl-3">
              <li>• Quick Check-in Button drücken</li>
              <li>• Einen Dankbarkeits-Chip antippen</li>
              <li>• Den Abend-Check-out absenden (auch leer)</li>
              <li>• Den Morgen-Check-in absenden (auch leer)</li>
            </ul>
            <p className="mt-2 text-sage-600 font-medium">
              Kein Druck — jede Interaktion zählt. Du musst nichts schreiben.
            </p>
          </div>
        </SettingCard>

        {/* Remote Content URL */}
        <SettingCard>
          <h3 className="text-sm font-semibold text-stone-700 mb-1">Zitat-Quelle (optional)</h3>
          <p className="text-xs text-stone-400 mb-3">
            URL zu einem Ordner mit quotes.json und morning_messages.json
          </p>
          <input
            type="url"
            value={settings.remoteContentUrl}
            onChange={(e) => updateSetting('remoteContentUrl', e.target.value)}
            placeholder="https://example.com/content/"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-honey-300 focus:border-honey-300 transition-all"
          />
          {contentState && (
            <div className="mt-2 text-xs text-stone-400">
              Quelle: {contentState.source === 'local' ? 'Lokal (Standard)' : 'Remote (gecacht)'}
              {contentState.lastFetchedAt && (
                <span>
                  {' '}
                  — Zuletzt geladen: {new Date(contentState.lastFetchedAt).toLocaleDateString('de-DE')}
                </span>
              )}
            </div>
          )}
        </SettingCard>

        {/* Export */}
        <SettingCard>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Daten exportieren</h3>
          <div className="flex gap-3">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 text-sm font-medium text-stone-600 hover:bg-stone-200 transition-all"
            >
              JSON
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 text-sm font-medium text-stone-600 hover:bg-stone-200 transition-all"
            >
              Markdown
            </button>
          </div>
          {exportMsg && (
            <p className="text-xs text-sage-600 mt-2 text-center font-medium">
              {exportMsg}
            </p>
          )}
        </SettingCard>

        {/* App Info */}
        <SettingCard>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-stone-700">Daily Win</p>
            <p className="text-xs text-stone-400">Version 0.1.0 — MVP</p>
            <p className="text-xs text-stone-400">
              Daten werden lokal auf deinem Gerät gespeichert.
            </p>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-soft px-4 py-4">
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
        enabled ? 'bg-honey-400' : 'bg-stone-300'
      }`}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
          enabled ? 'left-[1.375rem]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
