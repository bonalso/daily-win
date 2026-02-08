import { ContentData } from './types';
import { todayString, dailyIndex } from './utils';
import { getCachedContent, saveCachedContent, getContentState, saveContentState } from './db';
import { DEFAULT_QUOTES } from './quotes';
import { DEFAULT_MORNING_MESSAGES } from './morning-messages';

const FALLBACK_QUOTE = 'Atme kurz durch. Du musst heute nicht perfekt sein.';
const FALLBACK_MORNING = 'Schön, dass du da bist. Heute reicht auch ein kleiner Schritt 💛';

const LOCAL_CONTENT: ContentData = {
  quotes: DEFAULT_QUOTES,
  morningMessages: DEFAULT_MORNING_MESSAGES
};

async function fetchAndCacheRemoteContent(baseUrl: string): Promise<boolean> {
  if (!baseUrl) return false;

  try {
    const quotesUrl = baseUrl.endsWith('/') ? `${baseUrl}quotes.json` : `${baseUrl}/quotes.json`;
    const messagesUrl = baseUrl.endsWith('/') ? `${baseUrl}morning_messages.json` : `${baseUrl}/morning_messages.json`;

    const quotesRes = await fetch(quotesUrl, { cache: 'no-cache' });
    const messagesRes = await fetch(messagesUrl, { cache: 'no-cache' });

    if (!quotesRes.ok || !messagesRes.ok) return false;

    const quotes = await quotesRes.json();
    const morningMessages = await messagesRes.json();

    if (!Array.isArray(quotes) || !Array.isArray(morningMessages)) return false;
    if (quotes.length === 0 || morningMessages.length === 0) return false;

    const content: ContentData = { quotes, morningMessages };
    await saveCachedContent(content);

    const state = await getContentState();
    state.source = 'cachedRemote';
    state.lastFetchedAt = Date.now();
    state.cachedRemoteVersion = (state.cachedRemoteVersion ?? 0) + 1;
    await saveContentState(state);

    return true;
  } catch {
    return false;
  }
}

export async function getContent(remoteUrl?: string): Promise<ContentData> {
  const cached = await getCachedContent();

  const hasCached =
    !!cached &&
    Array.isArray(cached.quotes) &&
    cached.quotes.length > 0 &&
    Array.isArray(cached.morningMessages) &&
    cached.morningMessages.length > 0;

  if (hasCached) {
    if (remoteUrl) fetchAndCacheRemoteContent(remoteUrl).catch(() => {});
    return cached as ContentData;
  }

  if (remoteUrl) {
    const fetched = await fetchAndCacheRemoteContent(remoteUrl);
    if (fetched) {
      const fresh = await getCachedContent();
      if (fresh) return fresh as ContentData;
    }
  }

  return LOCAL_CONTENT;
}

export async function getTodayQuote(remoteUrl?: string): Promise<string> {
  const content = await getContent(remoteUrl);

  if (!content.quotes || content.quotes.length === 0) return FALLBACK_QUOTE;

  const idx = dailyIndex(todayString(), content.quotes.length);
  const quote = content.quotes[idx];

  return typeof quote === 'string' && quote.trim().length > 0 ? quote : FALLBACK_QUOTE;
}

export async function getTodayMorningMessage(remoteUrl?: string): Promise<string> {
  const content = await getContent(remoteUrl);

  if (!content.morningMessages || content.morningMessages.length === 0) return FALLBACK_MORNING;

  const idx = dailyIndex(`${todayString()}_morning`, content.morningMessages.length);
  const msg = content.morningMessages[idx];

  return typeof msg === 'string' && msg.trim().length > 0 ? msg : FALLBACK_MORNING;
}
