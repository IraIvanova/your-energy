import { fetchJson } from './api';
import type { CatalogState } from './catalog-state';

export type Category = {
  filter: string;
  name: string;
  imgURL: string;
};

export type CategoriesResponse = {
  results: Category[];
  totalPages: number;
};

const CATEGORIES_URL = 'https://your-energy.b.goit.study/api/filters';

export function categoriesUrl(state: CatalogState): string {
  const params = new URLSearchParams();
  params.set('filter', state.filter);
  params.set('page', String(state.page));
  params.set('limit', String(state.limit));

  return CATEGORIES_URL + '?' + params.toString();
}

export function loadCategories(
  state: CatalogState,
  signal?: AbortSignal
): Promise<CategoriesResponse> {
  const url = categoriesUrl(state);
  return fetchJson<CategoriesResponse>(url, { signal });
}
