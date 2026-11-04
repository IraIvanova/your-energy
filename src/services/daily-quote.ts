import { fetchJson } from './api';

export interface DailyQuote {
  author: string;
  quote: string;
}

interface CachedQuote extends DailyQuote {
  date: string;
}

const QUOTE_URL = 'https://your-energy.b.goit.study/api/quote';
const STORAGE_KEY = 'daily-quote';

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isQuote(value: unknown): value is DailyQuote {
  if (!value || typeof value !== 'object') return false;
  const quote = value as Partial<DailyQuote>;
  return (
    typeof quote.author === 'string' &&
    quote.author.trim().length > 0 &&
    typeof quote.quote === 'string' &&
    quote.quote.trim().length > 0
  );
}

export class DailyQuoteService {
  private cached: CachedQuote | undefined;
  private pending: { date: string; promise: Promise<DailyQuote> } | undefined;

  async getQuote(): Promise<DailyQuote> {
    const date = today();
    if (this.cached?.date === date) {
      return { author: this.cached.author, quote: this.cached.quote };
    }

    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? 'null'
      );
      if (isQuote(stored) && 'date' in stored && stored.date === date) {
        this.cached = { author: stored.author, quote: stored.quote, date };
        return { author: stored.author, quote: stored.quote };
      }
    } catch {
      // A damaged cache or blocked storage must not prevent the API request.
    }

    if (this.pending?.date === date) return this.pending.promise;

    const promise = this.loadQuote(date);
    this.pending = { date, promise };
    try {
      return await promise;
    } finally {
      if (this.pending?.promise === promise) this.pending = undefined;
    }
  }

  private async loadQuote(date: string): Promise<DailyQuote> {
    const response = await fetchJson<unknown>(QUOTE_URL, {
      signal: AbortSignal.timeout(15000),
    });
    if (!isQuote(response)) throw new Error('Invalid quote response');
    // Do not display yesterday's response if the request crossed midnight.
    if (date !== today()) return this.getQuote();

    const quote = { author: response.author, quote: response.quote };
    this.cached = { ...quote, date };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cached));
    } catch {
      // Keep the in-memory cache when persistent storage is unavailable.
    }
    return quote;
  }
}

export const dailyQuoteService = new DailyQuoteService();
