import type { Filter } from '../../services/types';

export function createCategoryCard(
  template: HTMLTemplateElement,
  filter: Filter
): HTMLElement {
  const card = template.content.firstElementChild?.cloneNode(
    true
  ) as HTMLElement | null;
  if (!card) throw new Error('Category card template is missing.');

  const link = card as HTMLAnchorElement;
  const name = card.querySelector<HTMLElement>('.category-card__name');
  const image = card.querySelector<HTMLImageElement>('.category-card__image');
  if (!name || !image) throw new Error('Category card template is incomplete.');

  link.dataset.categoryName = filter.name;
  link.dataset.categoryType = filter.filter;
  link.href = buildCategoryHash(filter.filter, filter.name);
  image.src = filter.imgURL;
  image.alt = filter.name;
  name.textContent = filter.name;
  return card;
}

function buildCategoryHash(
  filterType: Filter['filter'],
  category: string
): string {
  const slug = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return `#/category/${slug(filterType)}/${slug(category)}`;
}
