import type {
  Exercise,
  ExercisesResponse,
  Filter,
  FiltersResponse,
  Quote,
} from './types';

const API_BASE_URL = 'https://your-energy.b.goit.study/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`.trim(),
      response.status
    );
  }

  return (await response.json()) as T;
}

export function getExercises(page = 1, limit = 9): Promise<ExercisesResponse> {
  return fetchJson<ExercisesResponse>(
    `${API_BASE_URL}/exercises?page=${page}&limit=${limit}`
  );
}

export function getExercisesByFilter(
  filterType: Filter['filter'],
  filterName: string,
  page = 1,
  limit = 9,
  keyword = ''
): Promise<ExercisesResponse> {
  const parameter =
    filterType === 'Body parts'
      ? 'bodypart'
      : filterType === 'Equipment'
        ? 'equipment'
        : 'muscle';
  const search = keyword.trim()
    ? `&keyword=${encodeURIComponent(keyword.trim())}`
    : '';
  return fetchJson<ExercisesResponse>(
    `${API_BASE_URL}/exercises?${parameter}=${encodeURIComponent(
      filterName
    )}&page=${page}&limit=${limit}${search}`
  );
}

export function getFilters(page = 1, limit = 12): Promise<FiltersResponse> {
  return fetchJson<FiltersResponse>(
    `${API_BASE_URL}/filters?page=${page}&limit=${limit}`
  );
}

export async function getAllFilters(): Promise<Filter[]> {
  const firstPage = await getFilters();
  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getFilters(index + 2)
    )
  );
  return [firstPage, ...remainingPages].flatMap(page => page.results);
}

export function getQuote(): Promise<Quote> {
  return fetchJson<Quote>(`${API_BASE_URL}/quote`);
}

export function getExerciseById(id: string): Promise<Exercise> {
  return fetchJson<Exercise>(
    `${API_BASE_URL}/exercises/${encodeURIComponent(id)}`
  );
}

export function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  return Promise.all(ids.map(id => getExerciseById(id)));
}
