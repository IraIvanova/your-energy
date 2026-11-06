// Task 05 / 07 — Categories API (owners: IraIvanova, vitos2802).
import { API_BASE_URL, fetchJson, normalizePage } from './api';
import type { Filter, FiltersResponse } from './types';

export type FilterName = Filter['filter'];

/** One page of categories for a filter: /filters?filter=&page=&limit= */
export function getFiltersOfExercises(
  filter: FilterName,
  page: number,
  limit: number
): Promise<FiltersResponse> {
  const query = new URLSearchParams({
    filter,
    page: String(page),
    limit: String(limit),
  });
  return fetchJson<FiltersResponse>(`${API_BASE_URL}/filters?${query}`).then(
    normalizePage
  );
}
