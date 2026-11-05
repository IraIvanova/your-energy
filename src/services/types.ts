export interface Exercise {
  _id: string;
  name: string;
  burnedCalories: number;
  bodyPart: string;
  equipment: string;
  target: string;
  rating?: number;
  gifUrl?: string;
  description?: string;
  popularity?: number;
}

export interface ExercisesResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalResults: number;
  results: Exercise[];
}

export interface Filter {
  filter: 'Body parts' | 'Equipment' | 'Muscles';
  name: string;
  imgURL: string;
}

export interface FiltersResponse {
  page: number;
  perPage: number;
  totalPages: number;
  totalResults: number;
  results: Filter[];
}

export interface Quote {
  author: string;
  quote: string;
}
