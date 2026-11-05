import { renderCategoryCard } from '../category-card/category-card';
import { loadCategories, type Category } from '../../services/catalog';
import {
  getCatalogState,
  selectCategory,
  type CatalogState,
} from '../../services/catalog-state';

type CatalogElements = {
  catalog: HTMLElement;
  list: HTMLElement;
  status: HTMLElement;
  retry: HTMLButtonElement;
  template: HTMLTemplateElement;
};

type CatalogContext = {
  elements: CatalogElements;
  loadNumber: number;
};

function getCatalogElements(root: HTMLElement): CatalogElements | null {
  const catalog = root.querySelector<HTMLElement>('[data-category-catalog]');

  if (!catalog) return null;

  const list = catalog.querySelector<HTMLElement>('[data-catalog-list]');
  const status = catalog.querySelector<HTMLElement>('[data-catalog-status]');
  const retry = catalog.querySelector<HTMLButtonElement>(
    '[data-catalog-retry]'
  );
  const template =
    root.querySelector<HTMLTemplateElement>('#category-template');

  if ([list, status, retry, template].some(el => el === null)) {
    return null;
  }

  return { catalog, list, status, retry, template } as CatalogElements;
}

function prepareCatalog(elements: CatalogElements, state: CatalogState) {
  elements.list.textContent = '';
  elements.retry.hidden = true;
  elements.catalog.hidden = state.category !== null;
  elements.catalog.setAttribute('aria-busy', 'false');
}

function showLoading(elements: CatalogElements) {
  elements.status.hidden = false;
  elements.status.textContent = 'Loading categories…';
  elements.catalog.setAttribute('aria-busy', 'true');
}

function renderCategories(
  elements: CatalogElements,
  categories: Category[],
  onClick: (name: string) => void
) {
  for (const category of categories) {
    const card = renderCategoryCard(elements.template, category, onClick);
    if (!card) continue;
    elements.list.append(card);
  }
}

function showEmptyResult(elements: CatalogElements) {
  elements.status.hidden = false;
  elements.status.textContent =
    'Unfortunately, no results were found. You may want to consider other search options to find the exercise you are looking for. Our range is wide and you have the opportunity to find more options that suit your needs.';
}

function showError(elements: CatalogElements) {
  elements.status.hidden = false;
  elements.status.textContent = 'Unable to load categories. Please try again.';
  elements.retry.hidden = false;
}

function onCategorySelect(context: CatalogContext, name: string) {
  selectCategory(name);
  void loadCurrentCategories(context);
}

function loadCurrentCategories(context: CatalogContext) {
  const elements = context.elements;
  const state = getCatalogState();
  context.loadNumber += 1;
  const currentLoadNumber = context.loadNumber;
  prepareCatalog(elements, state);

  if (state.category !== null) return;

  showLoading(elements);

  return loadCategories(state)
    .then(response => {
      if (currentLoadNumber !== context.loadNumber) return;

      if (response.results.length === 0) {
        showEmptyResult(elements);
      } else {
        renderCategories(elements, response.results, name =>
          onCategorySelect(context, name)
        );
        elements.status.hidden = true;
      }
    })
    .catch(() => {
      if (currentLoadNumber !== context.loadNumber) return;
      showError(elements);
    })
    .finally(() => {
      if (currentLoadNumber !== context.loadNumber) return;
      elements.catalog.setAttribute('aria-busy', 'false');
    });
}

export function initCategoryCatalog(root: HTMLElement) {
  const elements = getCatalogElements(root);
  if (!elements) return;

  const context: CatalogContext = { elements, loadNumber: 0 };
  const refreshCatalog = () => loadCurrentCategories(context);

  elements.retry.addEventListener('click', refreshCatalog);
  refreshCatalog();

  return refreshCatalog;
}
