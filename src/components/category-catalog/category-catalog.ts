import { renderCategoryCard } from '../category-card/category-card';
import { loadCategories, type Category } from '../../services/catalog';
import {
  getCatalogState,
  selectCategory,
  catalogEvents,
  type CatalogState,
} from '../../services/catalog-state';

export function initCategoryCatalog(root: HTMLElement) {
  const catalog = root.querySelector<HTMLElement>('[data-category-catalog]')!;
  const list = catalog.querySelector<HTMLElement>('[data-catalog-list]')!;
  const status = catalog.querySelector<HTMLElement>('[data-catalog-status]')!;
  const retry = catalog.querySelector<HTMLButtonElement>(
    '[data-catalog-retry]'
  )!;
  const template =
    root.querySelector<HTMLTemplateElement>('#category-template')!;
  let request: AbortController | undefined;

  function prepareCatalog(state: CatalogState) {
    request?.abort();
    list.textContent = '';
    retry.hidden = true;
    catalog.hidden = state.category !== null;
    catalog.setAttribute('aria-busy', 'false');
  }

  function showLoading() {
    status.hidden = false;
    status.textContent = 'Loading categories…';
    catalog.setAttribute('aria-busy', 'true');
  }

  function renderCards(categories: Category[]) {
    for (const category of categories) {
      const card = renderCategoryCard(template, category, selectCategory);
      list.append(card);
    }
  }

  function showEmptyResult(categories: Category[]) {
    status.hidden = categories.length > 0;
    status.textContent =
      'Unfortunately, no results were found. You may want to consider other search options to find the exercise you are looking for. Our range is wide and you have the opportunity to find more options that suit your needs.';
  }

  function showError() {
    status.hidden = false;
    status.textContent = 'Unable to load categories. Please try again.';
    retry.hidden = false;
  }

  function fetchCategories(state: CatalogState) {
    const controller = new AbortController();
    request = controller;
    showLoading();

    return loadCategories(state, controller.signal)
      .then(response => {
        if (controller.signal.aborted) return;

        renderCards(response.results);
        showEmptyResult(response.results);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        showError();
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        catalog.setAttribute('aria-busy', 'false');
      });
  }

  function render(state: CatalogState) {
    prepareCatalog(state);

    if (state.category !== null) return;

    return fetchCategories(state);
  }

  retry.addEventListener('click', () => {
    void render(getCatalogState());
  });
  catalogEvents.addEventListener('catalog:change', () => {
    void render(getCatalogState());
  });
  void render(getCatalogState());
}
