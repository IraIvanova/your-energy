import type { Filter } from '../../services/types';

export function toUrlSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The category name goes into the URL as-is (encoded) so the exercises
 * request can be rebuilt from the hash alone, without the category list.
 */
export function buildCategoryHash(
  filterType: Filter['filter'],
  category: string,
  keyword = ''
): string {
  const query = keyword ? `?${new URLSearchParams({ keyword })}` : '';
  return `#/category/${toUrlSlug(filterType)}/${encodeURIComponent(
    category
  )}${query}`;
}

export function createCategoryCard(
  template: HTMLTemplateElement,
  filter: Filter
): HTMLElement {
  const card = template.content.firstElementChild?.cloneNode(
    true
  ) as HTMLAnchorElement | null;
  if (!card) throw new Error('Category card template is missing.');

  const name = card.querySelector<HTMLElement>('.category-card__name');
  const filterName = card.querySelector<HTMLElement>('.category-card__filter');
  const image = card.querySelector<HTMLImageElement>('.category-card__image');
  if (!name || !filterName || !image) {
    throw new Error('Category card template is incomplete.');
  }

  card.dataset.categoryName = filter.name;
  card.dataset.categoryType = filter.filter;
  card.href = buildCategoryHash(filter.filter, filter.name);
  image.src = filter.imgURL;
  image.alt = '';
  name.textContent = filter.name;
  filterName.textContent = filter.filter;
  return card;
}
