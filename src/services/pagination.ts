import {
  getExercisesByFilter,
  getFiltersOfExercises,
  type ExerciseFilter,
  type ExercisesResponse,
  type FilterName,
  type FilterResponse,
} from './api';

export interface PaginationState {
  page: number;
  limit: number;
  totalPages: number;
}

export interface CatalogState {
  filter: FilterName;
  category: string;
  keyword: string;
  filters: PaginationState;
  exercises: PaginationState;
}

const initialState: CatalogState = {
  filter: 'Muscles',
  category: '',
  keyword: '',
  filters: {
    page: 1,
    limit: window.matchMedia('(max-width: 767px)').matches ? 9 : 12,
    totalPages: 0,
  },
  exercises: {
    page: 1,
    limit: window.matchMedia('(max-width: 767px)').matches ? 8 : 10,
    totalPages: 0,
  },
};

export function createCatalogRequests(
  onFilters: (response: FilterResponse) => void,
  onExercises: (response: ExercisesResponse) => void,
  onError: (error: unknown, source: 'filters' | 'exercises') => void
) {
  const state = structuredClone(initialState);
  let filtersRequestId = 0;
  let exercisesRequestId = 0;

  async function loadFilters(): Promise<void> {
    const requestId = ++filtersRequestId;

    try {
      const response = await getFiltersOfExercises(
        state.filter,
        state.filters.page,
        state.filters.limit
      );

      if (requestId !== filtersRequestId) return;

      state.filters.totalPages = response.totalPages;
      state.filters.page = response.page;
      onFilters(response);
    } catch (error) {
      if (requestId === filtersRequestId) onError(error, 'filters');
    }
  }

  async function loadExercises(): Promise<void> {
    if (!state.category) return;

    const requestId = ++exercisesRequestId;

    try {
      const response = await getExercisesByFilter(
        toExerciseFilter(state.filter),
        state.category,
        state.exercises.page,
        state.exercises.limit,
        state.keyword || undefined
      );

      if (requestId !== exercisesRequestId) return;

      state.exercises.totalPages = response.totalPages;
      state.exercises.page = response.page;
      onExercises(response);
    } catch (error) {
      if (requestId === exercisesRequestId) onError(error, 'exercises');
    }
  }

  function changeFilter(filter: FilterName): void {
    exercisesRequestId++;
    state.filter = filter;
    state.category = '';
    state.filters.page = 1;
    state.exercises.page = 1;
    void loadFilters();
  }

  function changeCategory(category: string): void {
    exercisesRequestId++;
    state.category = category;
    state.exercises.page = 1;
    void loadExercises();
  }

  function changeKeyword(keyword: string): void {
    exercisesRequestId++;
    state.keyword = keyword;
    state.exercises.page = 1;
    void loadExercises();
  }

  function changeFiltersPage(page: number): void {
    state.filters.page = page;
    void loadFilters();
  }

  function changeExercisesPage(page: number): void {
    state.exercises.page = page;
    void loadExercises();
  }

  function cancelExercises(): void {
    exercisesRequestId++;
  }

  function cancelFilters(): void {
    filtersRequestId++;
  }

  return {
    state,
    cancelExercises,
    cancelFilters,
    loadFilters,
    loadExercises,
    changeFilter,
    changeCategory,
    changeKeyword,
    changeFiltersPage,
    changeExercisesPage,
  };
}

function toExerciseFilter(filter: FilterName): ExerciseFilter {
  switch (filter) {
    case 'Body parts':
      return 'bodypart';
    case 'Muscles':
      return 'muscles';
    case 'Equipment':
      return 'equipment';
  }
}
