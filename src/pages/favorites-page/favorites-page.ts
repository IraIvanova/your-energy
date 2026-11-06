import { getExercisesByIds, getQuote, type Quote } from '../../services/api';
import { createExerciseCard } from '../../components/exercise-card/exercise-card';
import { readFavoriteIds, removeFavoriteId } from '../../services/favorites';

const QUOTE_CACHE_KEY = 'your-energy-daily-quote';

function initFavoritesPage(): void {
  // Daily quote markup is shared with the home page, so every query is
  // scoped to the favorites page to avoid writing into the home copy.
  const root = document.querySelector<HTMLElement>('[data-page="/favorites"]');
  if (!root) {
    throw new Error('Favorites page is missing.');
  }

  const list = root.querySelector<HTMLElement>('[data-favorites-list]');
  const empty = root.querySelector<HTMLElement>('[data-favorites-empty]');
  const error = root.querySelector<HTMLElement>('[data-favorites-error]');
  const template = root.querySelector<HTMLTemplateElement>(
    '[data-exercise-template]'
  );
  const quoteText = root.querySelector<HTMLElement>('[data-quote-text]');
  const quoteAuthor = root.querySelector<HTMLElement>('[data-quote-author]');
  const quoteError = root.querySelector<HTMLElement>('[data-quote-error]');
  if (
    !list ||
    !empty ||
    !error ||
    !template ||
    !quoteText ||
    !quoteAuthor ||
    !quoteError
  ) {
    throw new Error('Favorites page is missing its list or empty state.');
  }

  let requestId = 0;

  const updateState = (): void => {
    const total = list.querySelectorAll('[data-exercise-card]').length;
    empty.hidden = total !== 0;
    list.hidden = total === 0;
  };

  const showError = (message: string): void => {
    list.textContent = '';
    list.hidden = true;
    empty.hidden = true;
    error.textContent = message;
    error.hidden = false;
  };

  const refreshFavoritesList = async (): Promise<void> => {
    const currentRequest = ++requestId;
    error.hidden = true;

    let favoriteIds: string[];
    try {
      favoriteIds = readFavoriteIds();
    } catch {
      showError('Your favorites data is corrupted. Please try again.');
      return;
    }

    if (favoriteIds.length === 0) {
      list.textContent = '';
      updateState();
      return;
    }

    try {
      const exercises = await getExercisesByIds(favoriteIds);
      // A newer refresh started while this one was in flight.
      if (currentRequest !== requestId) return;

      list.textContent = '';
      for (const exercise of exercises) {
        list.append(createExerciseCard(template, exercise, true));
      }
      updateState();
    } catch {
      if (currentRequest !== requestId) return;
      showError("We couldn't load your favorites. Please try again later.");
    }
  };

  // One delegated listener instead of re-binding every button on refresh.
  list.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-favorite-remove]'
    );
    if (!button) return;

    const card = button.closest<HTMLElement>('[data-exercise-card]');
    const id = card?.dataset.exerciseId;
    if (!card || !id) return;

    try {
      removeFavoriteId(id);
    } catch {
      showError('Your favorites data is corrupted. Please try again.');
      return;
    }
    card.remove();
    updateState();
  });

  window.addEventListener('favorites-updated', () => {
    void refreshFavoritesList();
  });

  // Quote and favorites load independently: a broken quote cache or a
  // failed quote request must not block the favorites list.
  void loadDailyQuote(quoteText, quoteAuthor, quoteError);
  void refreshFavoritesList();
}

function getToday(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function readCachedQuote(today: string): Quote | null {
  try {
    const cached = window.localStorage.getItem(QUOTE_CACHE_KEY);
    if (!cached) return null;
    const parsed: unknown = JSON.parse(cached);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'date' in parsed &&
      'quote' in parsed &&
      'author' in parsed &&
      parsed.date === today &&
      typeof parsed.quote === 'string' &&
      typeof parsed.author === 'string'
    ) {
      return { quote: parsed.quote, author: parsed.author };
    }
  } catch {
    try {
      window.localStorage.removeItem(QUOTE_CACHE_KEY);
    } catch {
      // Storage is unavailable; just fetch a fresh quote.
    }
  }
  return null;
}

async function loadDailyQuote(
  text: HTMLElement,
  author: HTMLElement,
  error: HTMLElement
): Promise<void> {
  const today = getToday();
  const cached = readCachedQuote(today);
  if (cached) {
    text.textContent = cached.quote;
    author.textContent = cached.author;
    return;
  }

  try {
    const quote = await getQuote();
    text.textContent = quote.quote;
    author.textContent = quote.author;
    error.hidden = true;
    try {
      window.localStorage.setItem(
        QUOTE_CACHE_KEY,
        JSON.stringify({
          date: today,
          quote: quote.quote,
          author: quote.author,
        })
      );
    } catch {
      // Caching is optional.
    }
  } catch {
    error.hidden = false;
  }
}

initFavoritesPage();
