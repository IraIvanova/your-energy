import { getExercisesByIds, getQuote } from '../../services/api';
import { createExerciseCard } from '../../components/exercise-card/exercise-card';
import { readFavoriteIds, removeFavoriteId } from '../../services/favorites';

async function initFavoritesPage(): Promise<void> {
  const list = document.querySelector<HTMLElement>('[data-favorites-list]');
  const empty = document.querySelector<HTMLElement>('[data-favorites-empty]');
  const error = document.querySelector<HTMLElement>('[data-favorites-error]');
  const template = document.querySelector<HTMLTemplateElement>(
    '[data-exercise-template]'
  );
  const quoteText = document.querySelector<HTMLElement>('[data-quote-text]');
  const quoteAuthor = document.querySelector<HTMLElement>(
    '[data-quote-author]'
  );
  const quoteError = document.querySelector<HTMLElement>('[data-quote-error]');
  const scrollbar = document.querySelector<HTMLElement>(
    '[data-favorites-scrollbar]'
  );
  const scrollbarThumb = document.querySelector<HTMLElement>(
    '[data-favorites-scrollbar-thumb]'
  );
  if (
    !list ||
    !empty ||
    !error ||
    !template ||
    !quoteText ||
    !quoteAuthor ||
    !quoteError ||
    !scrollbar ||
    !scrollbarThumb
  ) {
    throw new Error('Favorites page is missing its list or empty state.');
  }

  const updateScrollbar = (): void => {
    const scrollRange = scrollContainer?.scrollHeight ?? 0;
    const visibleHeight = scrollContainer?.clientHeight ?? 0;
    const trackHeight = scrollbar.clientHeight;
    if (scrollRange <= visibleHeight || trackHeight === 0) {
      scrollbar.hidden = true;
      return;
    }

    scrollbar.hidden = false;
    const thumbHeightPercent = (visibleHeight / scrollRange) * 100;
    const thumbHeight = Math.max((trackHeight * thumbHeightPercent) / 100, 1);
    scrollbarThumb.style.height = `${thumbHeightPercent}%`;
    const maxOffset = trackHeight - thumbHeight;
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    const maxScroll = scrollRange - visibleHeight;
    scrollbarThumb.style.transform = `translateY(${
      maxScroll === 0 ? 0 : (scrollTop / maxScroll) * maxOffset
    }px)`;
  };

  const scrollContainer = list.parentElement;
  scrollContainer?.addEventListener('scroll', updateScrollbar);
  window.addEventListener('resize', updateScrollbar);
  scrollbarThumb.addEventListener('pointerdown', event => {
    if (!scrollContainer) {
      return;
    }

    const startY = event.clientY;
    const startScrollTop = scrollContainer.scrollTop;
    const trackHeight = scrollbar.clientHeight;
    const thumbHeight = scrollbarThumb.offsetHeight;
    const maxScroll =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const maxOffset = trackHeight - thumbHeight;
    const onPointerMove = (moveEvent: PointerEvent): void => {
      if (maxOffset <= 0) {
        return;
      }
      scrollContainer.scrollTop =
        startScrollTop + ((moveEvent.clientY - startY) / maxOffset) * maxScroll;
    };
    const onPointerUp = (): void => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });

  const updateState = (): void => {
    const total = list.querySelectorAll('[data-exercise-card]').length;
    empty.hidden = total !== 0;
    list.hidden = total === 0;
    updateScrollbar();
  };

  try {
    await loadDailyQuote(quoteText, quoteAuthor, quoteError);
    list.textContent = '';
    empty.hidden = true;
    error.hidden = true;
    const favoriteIds = readFavoriteIds();
    if (favoriteIds.length === 0) {
      updateState();
      return;
    }

    const exercises = await getExercisesByIds(favoriteIds);
    for (const exercise of exercises) {
      list.append(createExerciseCard(template, exercise, true));
    }

    for (const button of list.querySelectorAll<HTMLButtonElement>(
      '[data-favorite-remove]'
    )) {
      button.addEventListener('click', () => {
        const card = button.closest<HTMLElement>('[data-exercise-card]');
        const id = card?.dataset.exerciseId;
        if (!card || !id) {
          throw new Error('Favorite card is missing its exercise id.');
        }

        removeFavoriteId(id);
        card.remove();
        updateState();
      });
    }
  } catch (reason) {
    error.hidden = false;
    list.hidden = true;
    if (reason instanceof SyntaxError) {
      error.textContent = 'Your favorites data is corrupted. Please try again.';
    }
    return;
  }

  updateState();
}

async function loadDailyQuote(
  text: HTMLElement,
  author: HTMLElement,
  error: HTMLElement
): Promise<void> {
  const key = 'your-energy-daily-quote';
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const cached = window.localStorage.getItem(key);
  if (cached) {
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
      text.textContent = parsed.quote;
      author.textContent = parsed.author;
      return;
    }
  }
  try {
    const quote = await getQuote();
    text.textContent = quote.quote;
    author.textContent = quote.author;
    window.localStorage.setItem(
      key,
      JSON.stringify({ date: today, quote: quote.quote, author: quote.author })
    );
  } catch {
    error.hidden = false;
  }
}

void initFavoritesPage();
window.addEventListener('favorites-updated', () => {
  void initFavoritesPage();
});
