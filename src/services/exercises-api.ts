// Tasks 06 / 07 / 08 / 09 — Exercises API.
// Exercise list + search (06, 07), details modal and rating (08),
// favorites (09). Add new exercise endpoints at the end of the file.
import { API_BASE_URL, fetchJson, normalizePage } from './api';
import type { FilterName } from './filters-api';
import type { Exercise, ExercisesResponse } from './types';

export type ExerciseFilter = 'muscles' | 'bodypart' | 'equipment';

const FILTER_PARAMS: Record<FilterName, ExerciseFilter> = {
  Muscles: 'muscles',
  'Body parts': 'bodypart',
  Equipment: 'equipment',
};

/** /exercises?<muscles|bodypart|equipment>=&keyword=&page=&limit= */
export function getExercisesByFilter(
  filterType: FilterName,
  filterName: string,
  page = 1,
  limit = 10,
  keyword = ''
): Promise<ExercisesResponse> {
  const query = new URLSearchParams({
    [FILTER_PARAMS[filterType]]: filterName,
    page: String(page),
    limit: String(limit),
  });
  if (keyword.trim()) query.set('keyword', keyword.trim());

  return fetchJson<ExercisesResponse>(
    `${API_BASE_URL}/exercises?${query}`
  ).then(normalizePage);
}

export function getExerciseById(id: string): Promise<Exercise> {
  return fetchJson<Exercise>(
    `${API_BASE_URL}/exercises/${encodeURIComponent(id)}`
  );
}

export function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  return Promise.all(ids.map(id => getExerciseById(id)));
}

export interface RatingRequest {
  rate: number;
  email: string;
  review: string;
}

/** Optional task 08: "Give a rating" form in the exercise modal. */
export function patchExerciseRating(
  id: string,
  rating: RatingRequest
): Promise<Exercise> {
  return fetchJson<Exercise>(
    `${API_BASE_URL}/exercises/${encodeURIComponent(id)}/rating`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rating),
    }
  );
}
