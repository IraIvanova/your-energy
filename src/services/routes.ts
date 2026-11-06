// Hash routes for the Home catalog (owner: yuliialiubenka, integration).
//   #/category/<filter-slug>                    categories of a filter
//   #/category/<filter-slug>/<name>?keyword=...  exercises of a category
import type { Filter } from './types';

type FilterType = Filter['filter'];

export function toUrlSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildFilterHash(filterType: FilterType): string {
  return `#/category/${toUrlSlug(filterType)}`;
}

/**
 * The category name goes into the URL as-is (encoded) so the exercises
 * request can be rebuilt from the hash alone, without the category list.
 */
export function buildCategoryHash(
  filterType: FilterType,
  category: string,
  keyword = ''
): string {
  const query = keyword ? `?${new URLSearchParams({ keyword })}` : '';
  return `${buildFilterHash(filterType)}/${encodeURIComponent(
    category
  )}${query}`;
}
