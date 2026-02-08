// ============================================================
// Daily Win — Export (JSON + Markdown)
// ============================================================

import { DayEntry } from './types';
import { getAllEntries } from './db';
import { friendlyDateLabel } from './utils';

/**
 * Export all entries as a JSON file download.
 */
export async function exportJSON(): Promise<void> {
  const entries = await getAllEntries();
  const data = {
    app: 'Daily Win',
    exportedAt: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `daily-win-export-${new Date().toISOString().slice(0, 10)}.json`);
}

/**
 * Export all entries as a Markdown file download.
 */
export async function exportMarkdown(): Promise<void> {
  const entries = await getAllEntries();
  let md = '# Daily Win — Mein Journal\n\n';
  md += `Exportiert am ${new Date().toLocaleDateString('de-DE')}\n\n---\n\n`;

  for (const entry of entries.reverse()) {
    md += `## ${friendlyDateLabel(entry.date)} (${entry.date})\n\n`;

    if (entry.quickCheckInPressed) {
      md += '✅ Kurzer Check-in\n\n';
    }

    if (entry.fallbackChipsSelected.length > 0) {
      md += `**Dankbar für:** ${entry.fallbackChipsSelected.join(', ')}\n\n`;
    }

    if (entry.evening) {
      const e = entry.evening;
      if (e.highlights.filter(Boolean).length > 0) {
        md += '**Highlights des Tages:**\n';
        e.highlights.filter(Boolean).forEach(h => { md += `- ${h}\n`; });
        md += '\n';
      }
      if (e.wins.filter(Boolean).length > 0) {
        md += '**Daily Wins:**\n';
        e.wins.filter(Boolean).forEach(w => { md += `- ${w}\n`; });
        md += '\n';
      }
      if (e.learned) {
        md += `**Gelernt:** ${e.learned}\n\n`;
      }
      if (e.gratitude.filter(Boolean).length > 0) {
        md += '**Dankbarkeit:**\n';
        e.gratitude.filter(Boolean).forEach(g => { md += `- ${g}\n`; });
        md += '\n';
      }
      if (e.letGo) {
        md += `**Losgelassen:** ${e.letGo}\n\n`;
      }
    }

    if (entry.morning) {
      const m = entry.morning;
      md += '### Morgenroutine\n\n';
      if (m.gratitude.filter(Boolean).length > 0) {
        md += '**Dankbar für:**\n';
        m.gratitude.filter(Boolean).forEach(g => { md += `- ${g}\n`; });
        md += '\n';
      }
      if (m.progress) {
        md += `**Fortschritt durch:** ${m.progress}\n\n`;
      }
      if (m.tasks.filter(Boolean).length > 0) {
        md += '**Aufgaben:**\n';
        m.tasks.filter(Boolean).forEach(t => { md += `- ${t}\n`; });
        md += '\n';
      }
      if (m.affirmation) {
        md += `**Affirmation:** ${m.affirmation}\n\n`;
      }
    }

    if (entry.favorites.length > 0) {
      md += '**⭐ Favoriten:**\n';
      entry.favorites.forEach(f => {
        md += `- [${f.type === 'highlight' ? 'Highlight' : 'Win'}] ${f.text}\n`;
      });
      md += '\n';
    }

    if (entry.minimalCheckIn && !entry.evening && !entry.morning && !entry.quickCheckInPressed && entry.fallbackChipsSelected.length === 0) {
      md += '*Minimaler Check-in — du warst da.*\n\n';
    }

    md += '---\n\n';
  }

  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, `daily-win-export-${new Date().toISOString().slice(0, 10)}.md`);
}

/**
 * Helper: trigger a file download in the browser.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
