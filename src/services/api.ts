const BASE_URL = 'https://your-energy.b.goit.study/api';

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

interface FilterExercise {
  filter: string;
  name: string;
  imgUrl: string;
}

export interface Pagination {
  page: number;
  perPage: number;
  totalPages: number;
}

interface FilterResponse extends Pagination {
  results: FilterExercise[];
}

interface Exercise {
  _id: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  name: string;
  target: string;
  description: string;
  rating: number;
  burnedCalories: number;
  time: number;
  popularity: number;
}

interface ExercisesResponse extends Pagination {
  results: Exercise[];
}

export type FilterName = 'Body parts' | 'Muscles' | 'Equipment';

export const getFiltersOfExercises = async (
  filter: FilterName,
  page: number,
  limit: number
): Promise<FilterResponse> => {
  const query = new URLSearchParams({
    filter,
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${BASE_URL}/filters?${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return (await response.json()) as FilterResponse;
};

export const getExercisesByFilter = async (
  filter: 'muscles' | 'bodypart' | 'equipment',
  exerciseName: string,
  page: number,
  limit: number,
  keyword?: string
): Promise<ExercisesResponse> => {
  const query = new URLSearchParams({
    [filter]: exerciseName,
    page: String(page),
    limit: String(limit),
    ...(keyword && { keyword }),
  });

  const response = await fetch(`${BASE_URL}/exercises?${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return (await response.json()) as ExercisesResponse;
};
