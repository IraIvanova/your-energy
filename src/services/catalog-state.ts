export const FILTERS = ['Muscles', 'Body parts', 'Equipment'] as const;
export type CatalogFilter = 'Muscles' | 'Body parts' | 'Equipment';
export const FILTER_KEYS = {
  Muscles: 'muscles',
  'Body parts': 'bodypart',
  Equipment: 'equipment',
} as const;

export type CatalogState = {
  filter: CatalogFilter;
  category: string | null;
  page: number;
  limit: number;
};

let state: CatalogState = Object.freeze({
  filter: 'Muscles',
  category: null,
  page: 1,
  limit: 12,
});

export const catalogEvents = new EventTarget();

export function getCatalogState() {
  return state;
}

function update(patch: Partial<CatalogState>) {
  state = Object.freeze({ ...state, ...patch });
  catalogEvents.dispatchEvent(new Event('catalog:change'));
}
export function selectFilter(filter: CatalogFilter) {
  update({ filter, category: null, page: 1 });
}
export function selectCategory(category: string | null) {
  update({ category, page: 1 });
}
export function setCatalogPage(page: number) {
  update({ page });
}
