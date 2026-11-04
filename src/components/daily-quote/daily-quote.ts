import { dailyQuoteService } from '../../services/daily-quote';

let initialized = false;

export function initDailyQuotes(): void {
  const cards = [
    ...document.querySelectorAll<HTMLElement>('[data-daily-quote]'),
  ];
  if (initialized || cards.length === 0) return;
  initialized = true;
  let loading = false;
  let displayedDay: string | undefined;

  async function updateQuotes(): Promise<void> {
    if (loading || displayedDay === new Date().toDateString()) return;
    loading = true;
    const focusedRetry = document.activeElement?.closest('[data-quote-retry]');
    for (const card of cards) {
      card.setAttribute('aria-busy', 'true');
      card.querySelector<HTMLElement>('[data-quote-content]')!.hidden = true;
      const status = card.querySelector<HTMLElement>('[data-quote-status]')!;
      status.hidden = false;
      status.textContent = 'Loading quote…';
      card.querySelector<HTMLButtonElement>('[data-quote-retry]')!.hidden =
        true;
    }

    try {
      const quote = await dailyQuoteService.getQuote();
      displayedDay = new Date().toDateString();
      for (const card of cards) {
        card.querySelector<HTMLElement>('[data-quote-text]')!.textContent =
          quote.quote;
        card.querySelector<HTMLElement>('[data-quote-author]')!.textContent =
          quote.author;
        card.querySelector<HTMLElement>('[data-quote-content]')!.hidden = false;
        const status = card.querySelector<HTMLElement>('[data-quote-status]')!;
        status.textContent = 'Quote loaded.';
        status.hidden = true;
      }
      const restoreFocus =
        document.activeElement === document.body ||
        document.activeElement === focusedRetry;
      if (restoreFocus)
        focusedRetry
          ?.closest('[data-daily-quote]')
          ?.querySelector<HTMLElement>('h2')
          ?.focus({ preventScroll: true });
    } catch {
      for (const card of cards) {
        card.querySelector<HTMLElement>('[data-quote-status]')!.textContent =
          'Couldn’t load the quote. Please try again.';
        card.querySelector<HTMLButtonElement>('[data-quote-retry]')!.hidden =
          false;
      }
      if (
        focusedRetry instanceof HTMLElement &&
        (document.activeElement === document.body ||
          document.activeElement === focusedRetry)
      )
        focusedRetry.focus({ preventScroll: true });
    } finally {
      for (const card of cards) card.setAttribute('aria-busy', 'false');
      loading = false;
    }
  }

  for (const card of cards) {
    card
      .querySelector('[data-quote-retry]')!
      .addEventListener('click', () => void updateQuotes());
  }
  window.addEventListener('hashchange', () => void updateQuotes());
  window.addEventListener('focus', () => void updateQuotes());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void updateQuotes();
  });

  function scheduleNextDay(): void {
    const now = new Date();
    const nextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    window.setTimeout(() => {
      void updateQuotes();
      scheduleNextDay();
    }, nextDay.getTime() - now.getTime());
  }

  scheduleNextDay();
  void updateQuotes();
}
