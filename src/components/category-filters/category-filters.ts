// Task 05 — Category filters (owner: IraIvanova).
// Contract used by pages/home-page: keep these exports and signatures.
import type { Filter } from '../../services/types';

export type FilterType = Filter['filter'];

export const FILTER_TYPES: FilterType[] = [
  'Muscles',
  'Body parts',
  'Equipment',
];
export const DEFAULT_FILTER: FilterType = 'Muscles';

function getRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>('[data-category-filters]');
  if (!root) throw new Error('Category filters are missing.');
  return root;
}

/** Calls onSelect when the user picks a filter button. */
export function initCategoryFilters(
  onSelect: (filter: FilterType) => void
): void {
  getRoot().addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-filter-type]'
    );
    const filter = FILTER_TYPES.find(
      type => type === button?.dataset.filterType
    );
    if (filter) onSelect(filter);
  });
}

/** Marks the button of the current filter as active. */
export function setActiveCategoryFilter(filter: FilterType): void {
  for (const button of getRoot().querySelectorAll<HTMLButtonElement>(
    '[data-filter-type]'
  )) {
    const isActive = button.dataset.filterType === filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  }
}
